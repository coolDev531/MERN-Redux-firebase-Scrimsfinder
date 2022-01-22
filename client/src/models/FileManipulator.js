/**
 * @method renameFile
 * takes a file and changes its name
 * @param {File} file the file that is going to have it's name changes
 * @param {String} newName
 */
const renameFile = async (file, newName) => {
  // does this have to be async?
  let fileExtension = file.name.substring(file.name.lastIndexOf('.')); // .jpg, .png, etc...
  let newFileName = `${newName}${fileExtension}`; // make a new name: scrim._id, current time, and extension

  // change name of file to something more traceable (I don't want users random names).
  return Object.defineProperty(file, 'name', {
    writable: true,
    value: newFileName, // file extension isn't necessary with this approach.
  });
};

// eslint-disable-next-line
module.exports = {
  renameFile,
};
