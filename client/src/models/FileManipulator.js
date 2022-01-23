/**
 * @method renameFile
 * takes a file and changes its name
 * @param {File} file the file that is going to have it's name changes
 * @param {String} newName
 */

export const renameFile = async (file, newName) => {
  // does this have to be async?
  let fileExtension = file.name.substring(file.name.lastIndexOf('.')); // .jpg, .png, etc...
  let newFileName = `${newName}${fileExtension}`; // make a new name: scrim._id, current time, and extension

  // change name of file to something more traceable (I don't want users random names).
  return Object.defineProperty(file, 'name', {
    writable: true,
    value: newFileName, // file extension isn't necessary with this approach.
  });
};

/**
 * @method checkFileSize
 * takes a file and checks if it fits the size range
 * @param {Boolean} success
 */

// 1 megabyte (in Memibyte format)
export const checkFileSize = async ({
  file,
  maxFileSizeMib = 0.953674,
  fileInputRef,
}) => {
  const fileSize = file.size / 1024 / 1024; // in MiB

  if (fileSize > maxFileSizeMib) {
    if (fileInputRef && fileInputRef.current !== undefined) {
      fileInputRef.current.value = '';
    }

    return false;
  }

  return true;
};

export const checkIsImage = async ({ file, fileInputRef, setCurrentAlert }) => {
  if (!/^image\//.test(file.type)) {
    // if file type isn't an image, return
    fileInputRef.current.value = '';
    setCurrentAlert({
      type: 'Error',
      message: `File ${file.name} is not an image! \nonly images are allowed.`,
    });
    return false;
  }

  return true;
};
