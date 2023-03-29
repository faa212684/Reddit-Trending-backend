export function convertArrayToObject(array:any[]) {
    const result = {};

    // Iterate over each object in the array
    for (const obj of array) {
        // Use the id property as the key for the new object
        const { id, ...rest } = obj;
        result[id] = {id,...rest };
    }
    //console.log(result)

    return result;
}
