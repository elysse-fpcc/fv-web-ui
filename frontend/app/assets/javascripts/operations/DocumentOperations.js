/*
Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import selectn from 'selectn'

import Nuxeo from 'nuxeo'

import StringHelpers from 'common/StringHelpers'
import BaseOperations from 'operations/BaseOperations'
import IntlService from 'views/services/intl'

export default class DocumentOperations extends BaseOperations {
  /**
 * Get a single document of a certain type based on a path and title match
 * This document may or may not contain children
 */
  static getDocument(pathOrUid = '', type, headers = {}, params = {}) {
    const properties = this.properties

    return new Promise(
      (resolve, reject) => {
        properties.client
          .repository()
          .fetch(pathOrUid, headers)
          .then((doc) => {
            resolve(doc)
          }).catch((error) => {
            if (error.hasOwnProperty('response')) {
              error.response.json().then(
                (jsonError) => {
                  if (jsonError.hasOwnProperty('status') && jsonError.status == '404') {
                    jsonError.message = jsonError.message + ' (404 - ' + IntlService.instance.translate({
                      key: 'operations.document_not_found',
                      default: 'Document not found',
                    }) + ')'
                  }

                  reject(StringHelpers.extractErrorMessage(jsonError))
                }
              )
            } else {
              return reject(error || IntlService.instance.translate({
                key: 'operations.could_not_access_server',
                default: 'Could not access server',
              }))
            }
          })
      })
  }

  /**
  * Publish a document
  */
  static publishDocument(pathOrUid = '', params = {}) {
    const properties = this.properties

    return new Promise(
      (resolve, reject) => {
        properties.client
          .operation('Document.PublishToSection')
          .params(params)
          .input(pathOrUid)
          .execute()
          .then((doc) => {
            resolve(doc)
          }).catch((error) => {
            reject(IntlService.instance.translate({
              key: 'operations.could_not_publish_document',
              default: 'Could not publish document',
              case: 'first',
              append: '.',
            }))
          })
      })
  }

  /**
  * Update a document
  */
  static updateDocument(doc, headers = {}) {
    const properties = this.properties

    return new Promise(
      (resolve, reject) => {
        doc.save(headers)
          .then((newDoc) => {
            if (newDoc) {
              resolve(newDoc)
            } else {
              reject(IntlService.instance.translate({
                key: 'operations.no_found',
                params: [type],
                default: `No ${type} found`,
                case: 'first',
                append: '.',
              }))
            }
          })
          .catch((error) => {
            error.response.json().then(
              (jsonError) => {
                reject(StringHelpers.extractErrorMessage(jsonError))
              }
            )
          })
      })
  }

  /**
  * Disable document
  */
  static disableDocument(pathOrUid) {
    const properties = this.properties

    return new Promise(
      (resolve, reject) => {
        properties.client
          .operation('FVDisableDocument')
          .input(pathOrUid)
          .execute()
          .then((doc) => {
            resolve(doc)
          })
          .catch((error) => {
            error.response.json().then(
              (jsonError) => {
                reject(StringHelpers.extractErrorMessage(jsonError))
              }
            )
          })
      })
  }

  /**
  * Enable document
  */
  static enableDocument(pathOrUid) {
    const properties = this.properties

    return new Promise(
      (resolve, reject) => {
        properties.client
          .operation('FVEnableDocument')
          .input(pathOrUid)
          .execute()
          .then((doc) => {
            resolve(doc)
          })
          .catch((error) => {
            error.response.json().then(
              (jsonError) => {
                reject(StringHelpers.extractErrorMessage(jsonError))
              }
            )
          })
      })
  }

  /**
  * Publish dialect
  */
  static publishDialect(pathOrUid) {
    const properties = this.properties

    return new Promise(
      (resolve, reject) => {
        properties.client
          .operation('FVPublishDialect')
          .input(pathOrUid)
          .execute()
          .then((doc) => {
            resolve(doc)
          })
          .catch((error) => {
            error.response.json().then(
              (jsonError) => {
                reject(StringHelpers.extractErrorMessage(jsonError))
              }
            )
          })
      })
  }

  /**
  * Unpublish dialect
  */
  static unpublishDialect(pathOrUid) {
    const properties = this.properties

    return new Promise(
      (resolve, reject) => {
        properties.client
          .operation('FVUnpublishDialect')
          .input(pathOrUid)
          .execute()
          .then((doc) => {
            resolve(doc)
          })
          .catch((error) => {
            error.response.json().then(
              (jsonError) => {
                reject(StringHelpers.extractErrorMessage(jsonError))
              }
            )
          })
      })
  }

  /**
  * Create a document
  */
  static createDocument(parentDocPathOrId, docParams) {
    const properties = this.properties

    return new Promise(
      (resolve, reject) => {
        properties.client
          .repository()
          .create(parentDocPathOrId, docParams, {headers: {'enrichers.document': 'breadcrumb'}})
          .then((doc) => {
            resolve(doc)
          })
          .catch((error) => {
            error.response.json().then(
              (jsonError) => {
                reject(StringHelpers.extractErrorMessage(jsonError))
              }
            )
          })
      })
  }

  /**
  * Create a document with a file attached
  */
  static createDocumentWithBlob(parentDoc, docParams, file) {
    const properties = this.properties

    return new Promise(
      (resolve, reject) => {
        // If file not empty, process blob and upload
        if (file) {
          const blob = new Nuxeo.Blob({
            content: file,
            name: file.name,
            mimeType: file.type,
            size: file.size,
          })

          properties.client
            .batchUpload()
            .upload(blob)
            .then((res) => {
              if (res) {
                // Create document
                properties.client
                  .operation('Document.Create')
                  .params(docParams)
                  .input(parentDoc)
                  .execute()
                  .then((newDoc) => {
                    // If blob uploaded, attach to created document
                    if (res != null) {
                      properties.client.operation('Blob.AttachOnDocument')
                        .param('document', newDoc.uid)
                        .input(res.blob)
                        .execute({schemas: ['dublincore', 'file']})

                      // Finally, resolve create document
                      resolve(newDoc)
                    }
                  })
                  .catch((error) => {
                    reject(IntlService.instance.translate({
                      key: 'operations.could_not_create_document',
                      default: 'Could not create document',
                      case: 'first',
                      append: '.',
                    }))
                  })
              } else {
                reject(IntlService.instance.translate({
                  key: 'operations.no_found',
                  params: [type],
                  default: `No ${type} found`,
                  case: 'first',
                  append: '.',
                }))
              }
            }).catch((error) => {
              reject(IntlService.instance.translate({
                key: 'operations.could_not_upload_file',
                default: 'Could not upload file',
                case: 'first',
                append: '.',
              }))
            })
        }
      })
  }

  /**
  * Get a single document by ID
  */
  getDocumentByID(id, headers = null, params = null) {
    // Expose fields to promise
    const client = this.client
    const selectDefault = this.selectDefault

    id = StringHelpers.clean(id)

    // Initialize an empty document from type
    const documentType = this.documentType

    return new Promise(
      // The resolver function is called with the ability to resolve or
      // reject the promise
      (resolve, reject) => {
        const defaultParams = {
          query: `SELECT * FROM ${documentType.prototype.entityTypeName} WHERE (ecm:uuid='${id}' AND ${selectDefault})`,
        }

        const defaultHeaders = {}

        params = Object.assign(defaultParams, params)
        headers = Object.assign(defaultHeaders, headers)

        client.operation('Document.Query')
          .params(params)
          .execute(headers).then((response) => {
            if (response.entries.length > 0) {
              resolve(new documentType(response.entries[0]))
            } else {
              reject(IntlService.instance.translate({
                key: 'operations.no_found',
                params: [documentType.prototype.entityTypeName],
                default: `No ${documentType.prototype.entityTypeName} found`,
                case: 'first',
                append: '.',
              }))
              reject()
            }
          }).catch((error) => {
            throw error
          })
      })
  }

  getDocumentsByDialect(client, dialect, query = null, headers = null, params = null) {
    // Initialize and empty document list from type
    const documentList = new this.documentTypePlural(null)

    return new Promise(
      (resolve, reject) => {
        const defaultParams = {
          query: ` SELECT * FROM ${documentList.model.prototype.entityTypeName}  WHERE (fva:dialect = '${
            dialect.get('id')
          }' AND ecm:isTrashed = 0) ${
            query ? `AND ${query}` : ''
          } ORDER BY dc:title`,
        }

        const defaultHeaders = {
          'enrichers.document': 'parentDoc',
        }

        params = Object.assign(defaultParams, params)
        headers = Object.assign(defaultHeaders, headers)

        client.operation('Document.Query')
          .params(params)
          .execute(headers).then((response) => {
            documentList.add(response.entries)
            resolve(documentList.toJSON())
          }).catch((error) => {
            throw error
          })
      })
  }

  /**
  * Executes an operation on the server
  */
  static executeOperation(input, operationName, operationParams, headers = {}, params = {}) {
    const sanitizeKeys = ['dialectPath']

    const properties = this.properties

    for (const paramKey in operationParams) {
      if (sanitizeKeys.indexOf(paramKey) !== -1) {
        operationParams[paramKey] = StringHelpers.clean(operationParams[paramKey])
      }
    }

    return new Promise(
      (resolve, reject) => {
        let operation = properties.client
          .operation(operationName)

        if (input) {
          operation = operation.input(input)
        }

        operation.params(operationParams)
          .execute(headers)
          .then((response) => {
            resolve(response)
          }).catch((error) => {
            if (error.hasOwnProperty('response')) {
              error.response.json().then(
                (jsonError) => {
                  reject(StringHelpers.extractErrorMessage(jsonError))
                }
              )
            } else {
              return reject(error || IntlService.instance.translate({
                key: 'operations.could_not_execute_operation',
                default: 'Could not execute operation ' + operationName,
                params: [IntlService.instance.searchAndReplace(operationName, {prepend: '"', append: '"'})],
              }))
            }
          })
      })
  }

  static getCharactersByDialect(path, headers = {}, params = {}) {
    const properties = this.properties
    const cleanedDialectPath = StringHelpers.clean(path)

    return new Promise(
      (resolve, reject) => {
        const defaultParams = {
          query: `SELECT * FROM FVCharacter WHERE (ecm:path STARTSWITH '${
            cleanedDialectPath
          }' AND ecm:isTrashed = 0) ORDER BY fvcharacter:alphabet_order ASC`,
        }

        params = Object.assign(defaultParams, params)

        properties.client.operation('Document.Query')
          .params(params)
          .execute(headers)
          .then((results) => {
            resolve(results)
          })
          .catch((error) => {
            reject(error)
          })
      })
  }

  static queryDocumentsByDialect(path, queryAppend, headers = {}, params = {}) {
    const properties = this.properties
    const cleanedDialectPath = StringHelpers.clean(path)

    return new Promise(
      (resolve, reject) => {
        const defaultParams = {
          query: `SELECT * FROM Document WHERE (ecm:path STARTSWITH '${
            cleanedDialectPath
          }' AND ecm:isTrashed = 0)${
            queryAppend
          } ORDER BY dc:title ASC`,
        }

        params = Object.assign(defaultParams, params)

        properties.client.operation('Document.Query')
          .params(params)
          .execute(headers)
          .then((results) => {
            resolve(results)
          })
          .catch((error) => {
            reject(error)
          })
      })
  }

  static searchDocuments(queryParam, queryPath, docTypes, headers = {}, params = {}) {
    const properties = this.properties

    return new Promise(
      (resolve, reject) => {
        const defaultParams = {
          query: `SELECT * FROM Document WHERE (ecm:path STARTSWITH '${
            queryPath
          }' AND ecm:isTrashed = 0) AND ecm:primaryType IN (${
            docTypes
          }) AND ecm:fulltext = '*${
            queryParam
          }*' ORDER BY dc:title ASC`,
        }

        params = Object.assign(defaultParams, params)

        properties.client.operation('Document.Query')
          .params(params)
          .execute({headers: {'enrichers.document': 'ancestry'}})
          .then((results) => {
            // Get the ancestry information out of the contextParameters and store it at the object root
            // This is necessary for the datagrid to be able to access it
            results.entries.map(
              (entry) => {
                entry.ancestry_family_title = selectn('dc:title', entry.contextParameters.ancestry.family)
                entry.ancestry_language_title = selectn('dc:title', entry.contextParameters.ancestry.language)
                entry.ancestry_dialect_title = selectn('dc:title', entry.contextParameters.ancestry.dialect)
              }
            )
            resolve(results)
          })
          .catch((error) => {
            reject(error)
          })
      })
  }
}
