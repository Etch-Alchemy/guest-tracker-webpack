var toolbox = {
clearSelection: () => {
  const selection = window.getSelection(); // Get the current Selection object
  if (selection) {
    selection.removeAllRanges(); // Remove all ranges from the selection, effectively deselecting text
  }
}
}
export default toolbox;