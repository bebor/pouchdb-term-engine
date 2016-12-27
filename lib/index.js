'use strict'

const _ = require('lodash')
const utils = require('./pouch-utils')
const SUPER_CHAR = '\uffff'

// zaujimave: https://github.com/nolanlawson/transform-pouch

// exports.getCollection = utils.toPromise(function (opts, callback) {
//   var pouch = this
//   // default options
//   opts = _.merge({}, opts)
//   console.log(opts)
//
//   var q = opts.query || opts.q
//   var mm = 'mm' in opts ? (parseFloat(opts.mm) / 100) : 1 // e.g. '75%'
//   var fields = opts.fields
//   var highlighting = opts.highlighting
//   var includeDocs = opts.include_docs
//   var destroy = opts.destroy
//   var stale = opts.stale
//   var limit = opts.limit
//   var build = opts.build
//   var skip = opts.skip || 0
//   var language = opts.language || 'en'
//   var filter = opts.filter
//
//   var instance = {
//     collection: 'xxx'
//   }
//
//   callback(null, instance)
// })

module.exports = function (Pouch) {
  // console.log('exporting Pouch', Pouch)

  // function getDbInstance() {
  //   return this
  // }

  // possibly a separate plugin pouchdb-collections
  Pouch.collections = {

    collectionDbPrefix: 'col',

    getDbName: function (collectionName) {
      // = get collection id
      return [this.collectionDbPrefix, collectionName].join('-')
    },

    getC: utils.toPromise(function (opts, callback) {
      callback(null, 'getC')
    }),

    getCollection: function (opts) {
      // collectionName, pouchDb, create
      opts = _.merge({
        name: null,
        create: false
      }, opts)

      // je to ako getInstance()
      // vrati (takmer sync) helper pre vsetko co treba
      var dbName = this.getDbName(opts.name)

      return new Promise((resolve, reject) => {
        // TODO toto nejako nefunguje
        let options = {
          skip_setup: !opts.create
        }

        // console.log('options', options)

        function _getMetaId () {
          return SUPER_CHAR + '-collection-meta'
        }

        var collectionDb = new Pouch(dbName, options)
        collectionDb.info()
          .then(() => {
            // The database exists.
            resolve({
              getDb: function () {
                return collectionDb
              },
              getServer: function () {
                return Pouch
              },
              getMeta: function () {
                return new Promise((resolve, reject) => {
                  let metaDocId = _getMetaId()
                  collectionDb.get(metaDocId, {}).then(doc => {
                    if (!doc.deleted && !doc.error) {
                      resolve(doc)
                    } else {
                      reject(false)
                    }
                  }, (err) => {
                    reject(err)
                  }).catch((err) => {
                    reject(err)
                  })
                })
              },
              setMeta: function (jsonData) {
                // TODO use pouchdb-upsert
                return new Promise((resolve, reject) => {
                  let metaDocId = _getMetaId()
                  this.getMeta().then((oldDoc) => {
                    // delete newDoc._id
                    // delete newDoc._rev
                    jsonData = _.merge(oldDoc, jsonData)
                    // console.log('meta exists, will be merged')
                    collectionDb.put(jsonData).then((res) => {
                      resolve(res)
                    }, (res) => {
                      reject(res)
                    })
                  }, () => {
                    jsonData._id = metaDocId
                    // console.log('meta does not exists, will be created', jsonData)
                    // jsonData = JSON.stringify(jsonData)
                    collectionDb.put(jsonData).then((res) => {
                      resolve(res)
                    }, (err) => {
                      reject(err)
                    }).catch(err => {
                      reject(err)
                    })
                  })
                })
              },
              removeMeta: function () {
                let metaDocId = _getMetaId()

                return new Promise((resolve, reject) => {
                  collectionDb.get(metaDocId).then(function (doc) {
                    if (!doc.deleted && !doc.error) {
                      return collectionDb.remove(doc).then((res) => {
                        resolve(res)
                      }, (res) => {
                        reject(res)
                      }).catch((err) => {
                        reject(err)
                      })
                    } else {
                      resolve(false)
                    }
                  }).catch(function (err) {
                    resolve()
                  })
                })
              },
              destroy: function () {
                return collectionDb.destroy()
              },
              compact: function () {
                return this.getDb().compact()
              }
            })
          }).catch(err => {
            // No database found and it was not created.
            reject(err)
          }
        )
      })
    }
  }

  Pouch.te = {

    enginePrefix: 'te-idx-',

    debug: true,

    log: function () {
      if (this.debug) {
        console.log(arguments)
      }
    },

    test: function () {
      this.log('pouchdb-term-engine is on')
    },

    createTerminology: function () {
    },
    destroyTerminology: function () {
    },

    useTerminology: function (dbPrimary, indexName) {
      // determine the dbIdx from dbPrimary+indexName
      // vrati obsluzny object so vsetkymi metodami, ktore by si mohol potrebovat
      // teda nieco ako wraper pre
    },

    buildIndexDocTerms: function () {
    },
    buildIndexTermDocs: function () {
    },

    asyncFlushTempIndexDocTerms: function (tempIndex) {
    },
    asyncFlushTempIndexTermDocs: function () {
    },
    asyncRecursiveBuild: function () {
    },

    findDocsByTerm: function (term, callbacks) {
      // callbacks: mergeTermsCallback, mergeDocsCallback, afterDone

    }, // uses te-idx-term-docs-{indexName}
    findTerms: function (options) {
    }, // uses te-idx-term-docs-{indexName}
    findTermsByDoc: function (options) {
    }, // uses te-idx-docs-term-{indexName}
    findTermByTest: function () {
    },

    funcFetchAllDocs: function (allDocsId) {
    },

    // resultset utils
    mergeLogicalAnd: function (old, latest) {
    },
    mergeLogicalOr: function (old, latest) {
    },
    mergeLogicalAndNot: function (old, latest) {
    }
  }

  Pouch.teAllDbs = function (dbPrimary) {
    return new Promise((resolve, reject) => {
      dbPrimary.allDocs(function (err, response) {
        if (err) {
          console.log("Couldn't get list of databases")
          reject(err)
        } else {
          console.log(response)
          //  destroy quick-search indexes
          // let jobs = response.filter((dbname) => {
          //   return dbname.indexOf(this.enginePrefix) === 0
          // }).map((idxDb) => {
          //   return () => {
          //     console.log('term-engine index: `' + idxDb + '`')
          //       // return pouchDbServer(idxDb).destroy()
          //   }
          // })

          resolve(444)

          // //  destroy quick-search indexes
          // let jobs = response.filter((dbname) => {
          //   return dbname.indexOf('idx') === 0
          // }).map((idxDb) => {
          //   return () => {
          //     console.log('droping `' + idxDb + '`')
          //     return pouchDbServer(idxDb).destroy()
          //   }
          // })
          //
          // jobs.reduce((p, fn) => p.then(fn, fn).catch((err) => {
          //     console.log(err)
          //     fn()
          //   }), Promise.resolve())
          //   .then(() => {
          //     cb(null, 'index-dbs successfully deleted')
          //   })
          //   .catch((err) => {
          //     cb(err)
          //   })
        }
      })
    })
  }
}
