module.exports = function(db, config){
  return {
    updateResource: updateResource
  };
  /**
   * Creates customer/source/payment objects
   * @param {string} ref - "resource" to update
   * @param {string} path - path to update
   * @param {*} value - value to set
   * @returns {promise} resolves to charge created by stripe lib
   */
  function updateResource(ref, path, value){
    const dbRef = db.ref(config.dbRef).child(ref);
    var update = {};
    update[path] = value;
    return dbRef.update(update).catch(function(err){
      const errors = db.ref(config.dbRef).child('errors');
      let key = errors.push().key;
      errors.child(key).set({
        timestamp: new Date().toISOString(),
        description: `Unable to update ${path} with ${value}`,
        error: {
          message: err.message,
          stack: err.stack
        }
      });
    });
  }
};
