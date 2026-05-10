export const dynamic = 'force-dynamic';
// app/api/candidate/[candidateid]/route.js
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { candidateApplications, jobPositions, interviewLinks } from '@/lib/db/schemaCharacterAI';
import { eq, and } from 'drizzle-orm';
import { logRecruiterActivity } from '@/lib/recruitment/activityLog';

// Function to generate 13-character UUID-like ID
function generateCandidateId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 13; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// GET - Handle both candidate link validation and candidate data retrieval
export async function GET(request, { params }) {
    try {
        const { candidateid } = params;
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        console.log('GET request with candidateid:', candidateid, 'action:', action);

        // If action is 'get-candidate', retrieve candidate data by ID
        if (action === 'get-candidate') {
            const candidate = await db
                .select()
                .from(candidateApplications)
                .where(eq(candidateApplications.id, parseInt(candidateid)))
                .limit(1);

            if (!candidate.length) {
                return NextResponse.json(
                    { error: 'Candidate not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                candidate: candidate[0]
            });
        }

        // Default behavior - Validate candidate link and get position info
        console.log('Validating candidate link:', candidateid);

        // Strategy 1: Find via interviewLinks.linkId
        let position = null;
        let linkRecord = null;

        const interviewLinkRows = await db
            .select({
                link: interviewLinks,
                position: jobPositions,
            })
            .from(interviewLinks)
            .leftJoin(jobPositions, eq(interviewLinks.positionId, jobPositions.id))
            .where(eq(interviewLinks.linkId, candidateid))
            .limit(1);

        console.log('Found interview link:', interviewLinkRows.length > 0 ? 'Yes' : 'No');

        if (interviewLinkRows.length > 0) {
            linkRecord = interviewLinkRows[0].link;
            position = interviewLinkRows[0].position;

            // Check if link is active and not expired
            if (linkRecord.status !== 'active') {
                return NextResponse.json(
                    { error: 'Registration link is not active' },
                    { status: 400 }
                );
            }

            if (linkRecord.expiresAt && new Date(linkRecord.expiresAt) < new Date()) {
                return NextResponse.json(
                    { error: 'Registration link has expired' },
                    { status: 400 }
                );
            }

            if (linkRecord.maxUses && linkRecord.currentUses >= linkRecord.maxUses) {
                return NextResponse.json(
                    { error: 'Registration link has reached maximum uses' },
                    { status: 400 }
                );
            }
        } else {
            // Strategy 2: Fallback – treat candidateid as a jobPositions.id directly
            console.log('Falling back to position ID lookup for:', candidateid);
            const positionRows = await db
                .select()
                .from(jobPositions)
                .where(eq(jobPositions.id, candidateid))
                .limit(1);

            if (positionRows.length > 0) {
                position = positionRows[0];
                console.log('Found position by ID:', position.id);
            } else {
                console.log('Link not found for candidateid:', candidateid);
                return NextResponse.json(
                    { error: 'Invalid registration link' },
                    { status: 404 }
                );
            }
        }

        // Check registration period (applies to both lookup strategies)
        if (position?.registrationStartDate && position?.registrationEndDate) {
            const now = new Date();
            const startDate = new Date(position.registrationStartDate);
            const endDate = new Date(position.registrationEndDate);
            const daysSinceEnd = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));

            if (now < startDate) {
                return NextResponse.json(
                    { error: 'Registration has not started yet' },
                    { status: 400 }
                );
            }

            if (daysSinceEnd > 30) {
                return NextResponse.json(
                    { error: 'Registration period has expired' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            position: position,
            linkId: candidateid
        });

    } catch (error) {
        console.error('GET request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const { candidateid } = params;
        const body = await request.json();

        // Resolve position from linkId (interviewLinks) or direct position id fallback
        let position = null;
        const interviewLinkRows = await db
            .select({ link: interviewLinks, position: jobPositions })
            .from(interviewLinks)
            .leftJoin(jobPositions, eq(interviewLinks.positionId, jobPositions.id))
            .where(eq(interviewLinks.linkId, candidateid))
            .limit(1);

        if (interviewLinkRows.length > 0) {
            const { link, position: pos } = interviewLinkRows[0];
            position = pos;
            if (link.status !== 'active') {
                return NextResponse.json({ error: 'Registration link is not active' }, { status: 400 });
            }
            if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
                return NextResponse.json({ error: 'Registration link has expired' }, { status: 400 });
            }
        } else {
            // Fallback: treat candidateid as a jobPositions.id
            const positionRows = await db
                .select()
                .from(jobPositions)
                .where(eq(jobPositions.id, candidateid))
                .limit(1);

            if (!positionRows.length) {
                return NextResponse.json({ error: 'Invalid registration link' }, { status: 404 });
            }
            position = positionRows[0];
        }

        // Check registration period
        if (position?.registrationStartDate && position?.registrationEndDate) {
            const now = new Date();
            const startDate = new Date(position.registrationStartDate);
            const endDate = new Date(position.registrationEndDate);
            const daysSinceEnd = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));

            if (now < startDate) {
                return NextResponse.json({ error: 'Registration has not started yet' }, { status: 400 });
            }
            if (daysSinceEnd > 30) {
                return NextResponse.json({ error: 'Registration period has expired' }, { status: 400 });
            }
        }

        // Extract form data
        const name = body.name;
        const email = body.email;
        const phone = body.phone;
        const country = body.country;
        const address = body.address;
        const experience = body.experience;
        const portfolioUrl = body.portfolioUrl;
        const linkedinUrl = body.linkedinUrl;
        const cv = body.cv; // CV text content

        // Validate required fields
        if (!name || !email || !phone || !country || !address || !experience) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Check if candidate already exists for this position
        const existingApplication = await db
            .select()
            .from(candidateApplications)
            .where(eq(candidateApplications.candidateEmail, email))
            .limit(1);

        if (existingApplication.length > 0) {
            return NextResponse.json(
                { error: 'An application with this email already exists' },
                { status: 409 }
            );
        }

        // Create candidate application record
        const newApplication = await db.insert(candidateApplications).values({
            positionId: position.id, // Use the actual position ID from the database query
            candidateId: null, // Set to null since these are external candidates without user accounts
            publicId: generateCandidateId(), // Generate 13-character public ID for external candidates
            candidateName: name,
            candidateEmail: email,
            candidatePhone: phone,
            country: country,
            address: address,
            experience: experience,
            portfolioUrl: portfolioUrl || null,
            linkedinUrl: linkedinUrl || null,
            cv: cv || null, // Store CV text content directly
            status: 'applied',
            isRejected: false,
            rejectReason: null,
            result: null,
            reasonResult: null,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();

        // Fire-and-forget: log a "registered" event for the recruiter feed.
        // Failures here must not break the candidate registration.
        if (position?.userId) {
            logRecruiterActivity({
                recruiterId: position.userId,
                type: 'registered',
                positionId: position.id,
                applicationId: newApplication[0]?.id,
                candidateName: name,
                candidateEmail: email,
                positionTitle: position.title,
            }).catch((e) => console.error('[activityLog] register:', e));
        }

        return NextResponse.json({
            success: true,
            application: newApplication[0],
            message: 'Application submitted successfully'
        });

    } catch (error) {
        console.error('Candidate registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}



export async function PUT(request, { params }) {
    try {
        const { candidateid } = params;
        const body = await request.json();

        // Get current application
        const currentApplication = await db
            .select()
            .from(candidateApplications)
            .where(eq(candidateApplications.id, parseInt(candidateid)))
            .limit(1);

        if (currentApplication.length === 0) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        // Update application with evaluation data
        const updatedApplication = await db
            .update(candidateApplications)
            .set({
                isRejected: body.isRejected ?? currentApplication[0].isRejected,
                rejectReason: body.rejectReason ?? currentApplication[0].rejectReason,
                result: body.result ?? currentApplication[0].result,
                reasonResult: body.reasonResult ?? currentApplication[0].reasonResult,
                status: body.status ?? currentApplication[0].status,
                updatedAt: new Date()
            })
            .where(eq(candidateApplications.id, parseInt(candidateid)))
            .returning();

        return NextResponse.json({
            success: true,
            application: updatedApplication[0],
            message: 'Application updated successfully'
        });

    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
