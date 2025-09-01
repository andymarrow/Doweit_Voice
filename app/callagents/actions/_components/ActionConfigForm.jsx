// /app/callagents/actions/_components/ActionConfigForm.jsx
import React from 'react';
import { FiPlusCircle, FiTrash2 } from 'react-icons/fi';

// Import constants - Adjust path as necessary
import { uiColors } from '../../_constants/uiConstants';

function ActionConfigForm({
    selectedType, // 'Text', 'Boolean', 'Choice', 'Action' (based on details.type)
    formData, // Contains { name, description, details: { type: '...', ... } }
    onChange, // General handler for name, description, and simple detail fields (like boolean labels)
    onChoiceChange, // Specific handler for choice options
    onAddChoice,
    onRemoveChoice,
    // Add the isSaving prop here
    isSaving,
}) {

    // Render ONLY the type-specific fields
    const renderTypeSpecificFields = () => {
        switch (selectedType) {
            case 'Text':
                // The 'Text' type currently doesn't have specific fields beyond Name and Description
                // You could add a placeholder or example text field here if needed later.
                 return null;
            case 'Boolean':
                return (
                    <div className="space-y-4">
                         {/* Boolean Options */}
                         <div>
                             <label className={`block text-sm font-medium mb-2 ${uiColors.textPrimary}`}>
                                 Boolean Options (e.g., Yes / No)
                             </label>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                      <label htmlFor="trueLabel" className={`block text-xs font-medium mb-1 ${uiColors.textSecondary}`}>
                                         "True" Value/Label <span className="text-red-500">*</span>
                                      </label>
                                     <input
                                         type="text"
                                         id="trueLabel"
                                         name="detail-trueLabel" // Use detail- prefix
                                         value={formData.details?.trueLabel || ''} // Use optional chaining for safety
                                         onChange={onChange}
                                         className={`block w-full rounded-md border-gray-300 shadow-sm text-sm px-3 py-2 ${uiColors.bgPrimary} ${uiColors.textPrimary} ${uiColors.borderPrimary} focus:border-${uiColors.accentPrimaryText} focus:ring-${uiColors.accentPrimaryText} outline-none`}
                                         placeholder="e.g., Yes"
                                         required // Frontend required for validation
                                         disabled={isSaving} // Disable when saving
                                     />
                                 </div>
                                  <div>
                                      <label htmlFor="falseLabel" className={`block text-xs font-medium mb-1 ${uiColors.textSecondary}`}>
                                         "False" Value/Label <span className="text-red-500">*</span>
                                      </label>
                                     <input
                                         type="text"
                                         id="falseLabel"
                                         name="detail-falseLabel" // Use detail- prefix
                                         value={formData.details?.falseLabel || ''} // Use optional chaining for safety
                                         onChange={onChange}
                                         className={`block w-full rounded-md border-gray-300 shadow-sm text-sm px-3 py-2 ${uiColors.bgPrimary} ${uiColors.textPrimary} ${uiColors.borderPrimary} focus:border-${uiColors.accentPrimaryText} focus:ring-${uiColors.accentPrimaryText} outline-none`}
                                         placeholder="e.g., No"
                                         required // Frontend required for validation
                                         disabled={isSaving} // Disable when saving
                                     />
                                  </div>
                             </div>
                         </div>
                    </div>
                );

            case 'Choice':
                return (
                    <div className="space-y-4">
                         {/* Choice Options */}
                         <div>
                             <label className={`block text-sm font-medium mb-2 ${uiColors.textPrimary}`}>
                                 Choice Options <span className="text-red-500">*</span>
                             </label>
                             <div className="space-y-3">
                                 {/* Check if options is an array before mapping */}
                                 {Array.isArray(formData.details?.options) && formData.details.options.map((option, index) => (
                                     <div key={option.id} className="flex items-center space-x-2">
                                         <input
                                              type="text"
                                              value={option.label || ''} // Use empty string if label is null/undefined
                                              onChange={(e) => onChoiceChange(option.id, e.target.value)}
                                              className={`block w-full rounded-md border-gray-300 shadow-sm text-sm px-3 py-2 ${uiColors.bgPrimary} ${uiColors.textPrimary} ${uiColors.borderPrimary} focus:border-${uiColors.accentPrimaryText} focus:ring-${uiColors.accentPrimaryText} outline-none`}
                                              placeholder={`Choice ${index + 1} label`}
                                              required // Frontend required for validation
                                              disabled={isSaving} // Disable when saving
                                         />
                                          {/* Remove Button */}
                                         {/* Only show remove if there's more than one option */}
                                         {formData.details.options.length > 1 && (
                                              <button
                                                  type="button"
                                                  onClick={() => onRemoveChoice(option.id)}
                                                   className={`p-2 rounded-md ${uiColors.hoverBgSubtle} text-red-500 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                                                  title="Remove choice"
                                                  disabled={isSaving || formData.details.options.length <= 1} // Disable when saving or if it's the last option
                                              >
                                                  <FiTrash2 className="w-4 h-4" />
                                              </button>
                                         )}
                                     </div>
                                 ))}
                                  {/* Add Choice Button */}
                                  <button
                                      type="button"
                                      onClick={onAddChoice}
                                       className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                                       disabled={isSaving} // Disable when saving
                                  >
                                      <FiPlusCircle className="mr-2 w-4 h-4" /> Add Choice
                                  </button>
                             </div>
                         </div>
                    </div>
                );

            case 'Action':
                 return (
                    <div className="space-y-4">
                         {/* Configuration fields specific to 'Action' type */}
                         <p className={`${uiColors.textSecondary} text-sm italic`}>
                              Configuration details for this action type would go here. (Placeholder)
                         </p>
                         {/* Example: Add an input for a config property */}
                           {/*
                         <div>
                              <label htmlFor="actionConfigValue" className={`block text-sm font-medium mb-1 ${uiColors.textPrimary}`}>
                                  Config Value (e.g., Transfer Number)
                              </label>
                               <input
                                   type="text" // Or appropriate type
                                   id="actionConfigValue"
                                   name="detail-config-value" // Use detail-prefix for config properties
                                   value={formData.details.config?.value || ''}
                                   onChange={onChange}
                                   className={`block w-full rounded-md border-gray-300 shadow-sm text-sm px-3 py-2 ${uiColors.bgPrimary} ${uiColors.textPrimary} ${uiColors.borderPrimary} focus:border-${uiColors.accentPrimaryText} focus:ring-${uiColors.accentPrimaryText} outline-none`}
                                   placeholder="Enter config value"
                                   disabled={isSaving} // Disable when saving
                               />
                           </div>
                           */}
                    </div>
                 );

            default:
                // If no type is selected or it's an unknown type, show nothing here
                return null;
        }
    };


    return (
        <div className="space-y-6">
            {/* Action Name Input - Moved outside the switch */}
            <div>
                <label htmlFor="actionName" className={`block text-sm font-medium mb-1 ${uiColors.textPrimary}`}>
                    Action Name (e.g., `first_name`) <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="actionName"
                    name="name" // Use name="actionName"
                    value={formData.name || ''} // Use empty string if null/undefined
                    onChange={onChange}
                    className={`block w-full rounded-md border-gray-300 shadow-sm text-sm px-3 py-2 ${uiColors.bgPrimary} ${uiColors.textPrimary} ${uiColors.borderPrimary} focus:border-${uiColors.accentPrimaryText} focus:ring-${uiColors.accentPrimaryText} outline-none`}
                    placeholder="Enter action name (lowercase_with_underscores)"
                    required
                    disabled={isSaving} // Disable when saving
                />
            </div>

            {/* Action Description Textarea - Added here */}
            <div>
                 <label htmlFor="actionDescription" className={`block text-sm font-medium mb-1 ${uiColors.textPrimary}`}>
                     Description (Optional)
                 </label>
                 <textarea
                     id="actionDescription"
                     name="description" // Use name="description"
                     value={formData.description || ''} // Use empty string if null/undefined
                     onChange={onChange}
                      className={`block w-full h-24 rounded-md border-gray-300 shadow-sm text-sm px-3 py-2 ${uiColors.bgPrimary} ${uiColors.textPrimary} ${uiColors.borderPrimary} focus:border-${uiColors.accentPrimaryText} focus:ring-${uiColors.accentPrimaryText} outline-none resize-y`}
                     placeholder="Describe what this action captures or does..."
                     disabled={isSaving} // Disable when saving
                 />
            </div>

{/* ***** NEW FIELD FOR isRequired ***** */}
            <div className={`flex items-center p-3 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                <input
                    type="checkbox"
                    id="isRequired"
                    name="isRequired"
                    checked={formData.isRequired ?? true} // Default to checked if undefined
                    onChange={onChange}
                    className={`h-4 w-4 rounded ${uiColors.accentPrimary} focus:ring-${uiColors.accentPrimaryText} border-gray-300`}
                    disabled={isSaving}
                />
                <div className="ml-3">
                    <label htmlFor="isRequired" className={`block text-sm font-medium ${uiColors.textPrimary}`}>
                        Required Action
                    </label>
                    <p className={`text-xs ${uiColors.textSecondary}`}>If checked, the AI will try to ensure this information is captured.</p>
                </div>
            </div>
            
            {/* Render type-specific fields below name and description */}
            {renderTypeSpecificFields()}

        </div>
    );
}

export default ActionConfigForm;