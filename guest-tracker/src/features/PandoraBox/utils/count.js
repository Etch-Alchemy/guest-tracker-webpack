var Count = {
  getMinMaxByDataProp: function getMinMaxByDataProp(dataPropName, arrayOfObjects) {
    var sortedArray = arrayOfObjects.sort(function (a, b) {
      return b[dataPropName] - a[dataPropName];
    });
    return {
      max: sortedArray[0][dataPropName],
      min: sortedArray[sortedArray.length - 1][dataPropName]
    };
  },
  getRandomObjectByDataProp: function getRandomObjectByDataProp(dataPropName, arrayOfObjects) {
    var bounds = Count.getMinMaxByDataProp(dataPropName, arrayOfObjects);
    var pick = bounds.min;
    for (var i = bounds.min; i <= bounds.max; i++) {
      var timefoolery = Date.now() * bounds.max;
      var condition = Number(timefoolery.toString().slice(-2)) % 2;
      if (condition == 0){
        pick = i;
        i = bounds.max;
      } 
    }
    return arrayOfObjects[pick];
  }
};

export default Count;

