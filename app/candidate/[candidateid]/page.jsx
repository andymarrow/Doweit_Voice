// app/candidate/[candidateid]/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Link as LinkIcon,
  Linkedin,
  MapPin,
  FileText,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function CandidateRegistrationPage({ params }) {
    const { candidateid } = params;
    
    const [step, setStep] = useState('loading');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [candidate, setCandidate] = useState({
        name: '',
        email: '',
        phone: '',
        country: '',
        address: '',
        experience: '',
        portfolioUrl: '',
        linkedinUrl: '',
        cv: '' // Text content of CV
    });
    
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Validate candidate ID and load position data
        const validateCandidateLink = async () => {
            try {
                const response = await fetch(`/api/candidate/${candidateid}`);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Invalid registration link');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    const position = data.position;
                    const now = new Date();
                    
                    // Check registration period
                    if (position?.registrationStartDate && position?.registrationEndDate) {
                        const startDate = new Date(position.registrationStartDate);
                        const endDate = new Date(position.registrationEndDate);
                        
                        if (now < startDate) {
                            setStep('not-open');
                        } else if (now > endDate) {
                            setStep('closed');
                        } else {
                            setStep('form');
                        }
                    } else {
                        setStep('form');
                    }
                } else {
                    setStep('error');
                }
            } catch (error) {
                console.error('Validation error:', error);
                setStep('error');
            }
        };

        if (candidateid) {
            validateCandidateLink();
        } else {
            setStep('error');
        }
    }, [candidateid]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!candidate.name.trim()) newErrors.name = 'Full name is required';
        if (!candidate.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) newErrors.email = 'Invalid email format';
        if (!candidate.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!candidate.country.trim()) newErrors.country = 'Country is required';
        if (!candidate.address.trim()) newErrors.address = 'Address is required';
        if (!candidate.experience) newErrors.experience = 'Experience level is required';
        
        // Strip HTML tags from CV content for validation
        const plainTextCv = candidate.cv.replace(/<[^>]*>/g, '').trim();
        if (!plainTextCv) newErrors.cv = 'CV content is required';
        else if (plainTextCv.length > 3000) newErrors.cv = 'CV content must be 3000 characters or less';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        try {
            // Only submit CV text content, not the file
            const applicationData = {
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone,
                country: candidate.country,
                address: candidate.address,
                experience: candidate.experience,
                portfolioUrl: candidate.portfolioUrl,
                linkedinUrl: candidate.linkedinUrl,
                cv: candidate.cv // Only submit the text content
            };

            const response = await fetch(`/api/candidate/${candidateid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(applicationData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit application');
            }

            const result = await response.json();
            
            if (result.success) {
                toast.success("Application submitted successfully!");
                setStep('success');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error(error.message || "Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCvTextChange = (value) => {
        // Strip HTML tags to check plain text length
        const plainText = value.replace(/<[^>]*>/g, '');
        if (plainText.length <= 3000) {
            setCandidate(prev => ({ ...prev, cv: value }));
            if (errors.cv) {
                setErrors(prev => ({ ...prev, cv: '' }));
            }
        }
    };

    if (step === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (step === 'not-open') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Not Open</h2>
                    <p className="text-gray-600">Registration for this position has not started yet. Please check back later.</p>
                </div>
            </div>
        );
    }

    if (step === 'closed') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Closed</h2>
                    <p className="text-gray-600">The registration period for this position has ended.</p>
                </div>
            </div>
        );
    }

    if (step === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Application Link</h2>
                    <p className="text-gray-600">This application link is not valid or has expired.</p>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for your application. We have received your information and will review it shortly.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold">Name:</span> {candidate.name}
                        </p>
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold">Email:</span> {candidate.email}
                        </p>
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold">Application ID:</span> {candidateid}
                        </p>
                    </div>
                    <button
                        onClick={() => window.close()}
                        className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    // Main registration form
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                        <div className="max-w-2xl">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Candidate Registration</h1>
                            <p className="text-blue-100">
                                Please provide your details to complete your application
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Information */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <User size={20} className="text-blue-600" />
                                    Personal Information
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input 
                                                required 
                                                type="text" 
                                                placeholder="John Doe" 
                                                value={candidate.name}
                                                onChange={(e) => setCandidate(prev => ({ ...prev, name: e.target.value }))}
                                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.name ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                            />
                                        </div>
                                        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input 
                                                required 
                                                type="email" 
                                                placeholder="john@example.com" 
                                                value={candidate.email}
                                                onChange={(e) => setCandidate(prev => ({ ...prev, email: e.target.value }))}
                                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.email ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input 
                                                required 
                                                type="tel" 
                                                placeholder="+1 (555) 000-0000" 
                                                value={candidate.phone}
                                                onChange={(e) => setCandidate(prev => ({ ...prev, phone: e.target.value }))}
                                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.phone ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Country *</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input 
                                                required 
                                                type="text" 
                                                placeholder="United States" 
                                                value={candidate.country}
                                                onChange={(e) => setCandidate(prev => ({ ...prev, country: e.target.value }))}
                                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.country ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                            />
                                        </div>
                                        {errors.country && <p className="text-red-500 text-xs">{errors.country}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-semibold text-gray-700">Address *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                                            <textarea
                                                required
                                                placeholder="123 Main St, City, State, ZIP Code"
                                                value={candidate.address}
                                                onChange={(e) => setCandidate(prev => ({ ...prev, address: e.target.value }))}
                                                rows={2}
                                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                                    errors.address ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                            />
                                        </div>
                                        {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <Briefcase size={20} className="text-blue-600" />
                                    Professional Information
                                </h2>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Years of Experience *</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <select 
                                                required 
                                                value={candidate.experience}
                                                onChange={(e) => setCandidate(prev => ({ ...prev, experience: e.target.value }))}
                                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                                                    errors.experience ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                            >
                                                <option value="">Select Experience</option>
                                                <option value="0-1">0-1 Years</option>
                                                <option value="1-3">1-3 Years</option>
                                                <option value="3-5">3-5 Years</option>
                                                <option value="5-10">5-10 Years</option>
                                                <option value="10+">10+ Years</option>
                                            </select>
                                        </div>
                                        {errors.experience && <p className="text-red-500 text-xs">{errors.experience}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Portfolio Link</label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input 
                                                    type="url" 
                                                    placeholder="https://portfolio.com" 
                                                    value={candidate.portfolioUrl}
                                                    onChange={(e) => setCandidate(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">LinkedIn Profile</label>
                                            <div className="relative">
                                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input 
                                                    type="url" 
                                                    placeholder="https://linkedin.com/in/username" 
                                                    value={candidate.linkedinUrl}
                                                    onChange={(e) => setCandidate(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CV/Resume Section */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <FileText size={20} className="text-blue-600" />
                                    CV / Resume
                                </h2>

                                <div className="space-y-6">
                                    {/* CV Rich Text Editor */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            CV Content {candidate.cv.length > 0 && `(${candidate.cv.replace(/<[^>]*>/g, '').length}/3000 chars)`}
                                        </label>
                                        <div className={`border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.cv ? 'border-red-300' : 'border-gray-200'
                                        }`}>
                                            <ReactQuill
                                                value={candidate.cv}
                                                onChange={handleCvTextChange}
                                                placeholder="Please type or paste your CV content here (max 3000 characters)..."
                                                theme="snow"
                                                modules={{
                                                    toolbar: [
                                                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                                        [{ 'font': [] }],
                                                        [{ 'size': ['small', false, 'large', 'huge'] }],
                                                        ['bold', 'italic', 'underline', 'strike'],
                                                        [{ 'color': [] }, { 'background': [] }],
                                                        [{ 'script': 'sub'}, { 'script': 'super' }],
                                                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                                                        [{ 'direction': 'rtl' }],
                                                        [{ 'align': [] }],
                                                        ['blockquote', 'code-block'],
                                                        ['link', 'image', 'video'],
                                                        ['clean']
                                                    ],
                                                    clipboard: {
                                                        matchVisual: false,
                                                    }
                                                }}
                                                formats={[
                                                    'header', 'font', 'size',
                                                    'bold', 'italic', 'underline', 'strike',
                                                    'color', 'background',
                                                    'script',
                                                    'list', 'bullet', 'ordered',
                                                    'indent', 'direction', 'align',
                                                    'blockquote', 'code-block',
                                                    'link', 'image', 'video'
                                                ]}
                                                style={{
                                                    minHeight: '250px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500">
                                                Use the rich text editor to format your CV (max 3000 characters)
                                            </p>
                                            {candidate.cv.length > 0 && (
                                                <span className={`text-xs ${candidate.cv.replace(/<[^>]*>/g, '').length > 3000 ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {candidate.cv.replace(/<[^>]*>/g, '').length}/3000
                                                </span>
                                            )}
                                        </div>
                                        {errors.cv && <p className="text-red-500 text-xs">{errors.cv}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            Submit Application <ChevronRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-xs mt-6">
                    Application ID: {candidateid} · Secure & Private
                </p>
            </div>
        </div>
    );
}