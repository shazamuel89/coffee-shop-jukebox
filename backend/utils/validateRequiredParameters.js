/**
 * Confirms that all required parameters are present in an object.
 * If one or more required parameters are missing, returns a clear error message.
 * 
 * @param {Object} dataObject - The object to check (usually req.body)
 * @param {Array<string>} requiredParameters - The list of required parameter names to verify
 * @returns {string|null} Returns an error message string if missing parameters, or null if all are present
 */

const confirmRequiredParameters = (dataObject, requiredParameters) => {
    // Array to store list of names of missing parameters
    const missingParameters = [];
    for (const parameter of requiredParameters) {
        // Important to allow false/0 values, so only reject undefined and null
        if (typeof dataObject[parameter] === 'undefined' || dataObject[parameter] === null) {
            missingParameters.push(parameter);
        }
    }

    // Forming error message
    if (missingParameters.length > 0) {                                 // If any parameters are missing
        let formattedList = '';                                         // Format the list based on number of parameters
        if (missingParameters.length > 2) {                             // If there are more than 2 missing parameters
            for (let i = 0; i < (missingParameters.length - 1); i++) {
                formattedList += (missingParameters[i] + ', ');         // Put ', ' after all but the last one
            }
            formattedList += ('and ' + missingParameters.at(-1));       // Put 'and ' before the last one
        } else if (missingParameters.length == 2) {                     // Else if there are exactly 2 missing parameters
            formattedList += missingParameters.join(' and ');           // Then put ' and ' between them
        } else {
            formattedList += missingParameters[0];                      // Else only put single parameter into list
        }
        // Return error message (only puts 's' at the end of field if multiple parameters are missing)
        return `Missing required ${formattedList} field${missingParameters.length > 1 ? 's' : ''}.`;
    }
    // Return null if all required parameters are present
    return null;
}

export default confirmRequiredParameters;