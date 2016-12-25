'use strict'

// var utils = require('./pouch-utils');
const charLast = '\ufff0'
  // TODO what is the second lowest string character? the one after null
const charFirst = ''
module.exports = function (Pouch) {
  const _ = require('lodash')

  // function getDbInstance() {
  //   return this
  // }

  function getDbServer() {
    // var pouch = this;
    // var PouchDB = pouch.constructor;
    return Pouch
  }

  // possibly a separate plugin pouchdb-collections
  Pouch.collections = {

    collectionDbPrefix: 'col',

    getDbName: function (collectionName) {
      // = get collection id
      return [this.collectionDbPrefix, collectionName].join('-')
    },

    getInstance: function (collectionName, create) {
      // je to ako getInstance()
      // vrati (takmer sync) helper pre vsetko co treba
      var dbName = this.getDbName(collectionName)

      return new Promise((resolve, reject) => {
        var Server = getDbServer()

        // zozen pointer na db of collection
        let options = {
          skip_setup: !create
        }

        var collectionDb = new Server(dbName, options)
        collectionDb.info()
          .then(() => {
            // The database exists.
            resolve({
              getDb: function () {
                return collectionDb
              },
              getServer: function () {
                return Server
              },
              getMeta: function () {
                return new Promise((resolve, reject) => {
                  resolve('TODO get meta')
                })
              },
              setMeta: function () {
                // uses upsert
                return new Promise((resolve, reject) => {
                  resolve('TODO set meta')
                })
              },
              destroy: function () {
                return new Promise((resolve, reject) => {
                  resolve('TODO destroy')
                })
              },
              compact: function () {
                // return db.compact().then(function (info) {
                //   // compaction complete
                // }).catch(function (err) {
                //   // handle errors
                // });

                return this.getDb().compact()

                // return new Promise((resolve, reject) => {
                //   resolve('TODO compact')
                // })
              }
            })
          })
          .catch(err => {
            // No database found and it was not created.
            reject(err)
          })
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

    createTerminology: function () {},
    destroyTerminology: function () {},

    useTerminology: function (dbPrimary, indexName) {
      // determine the dbIdx from dbPrimary+indexName
      // vrati obsluzny object so vsetkymi metodami, ktore by si mohol potrebovat
      // teda nieco ako wraper pre
    },

    buildIndexDocTerms: function () {},
    buildIndexTermDocs: function () {},

    asyncFlushTempIndexDocTerms: function (tempIndex) {},
    asyncFlushTempIndexTermDocs: function () {},
    asyncRecursiveBuild: function () {},

    findDocsByTerm: function (term, callbacks) {
      // callbacks: mergeTermsCallback, mergeDocsCallback, afterDone

    }, // uses te-idx-term-docs-{indexName}
    findTerms: function (options) {}, // uses te-idx-term-docs-{indexName}
    findTermsByDoc: function (options) {}, // uses te-idx-docs-term-{indexName}
    findTermByTest: function () {},

    funcFetchAllDocs: function (allDocsId) {},

    // resultset utils
    mergeLogicalAnd: function (old, latest) {},
    mergeLogicalOr: function (old, latest) {},
    mergeLogicalAndNot: function (old, latest) {}
  }

  Pouch.teAllDbs = function (dbPrimary) {
    return new Promise((resolve, reject) => {
      dbPrimary.allDocs(function (err, response) {
        if (err) {
          console.log("Couldn't get list of databases")
          reject(err)
        }
        else {
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
