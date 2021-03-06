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
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

// REDUX
import { connect } from 'react-redux'
// REDUX: actions/dispatch/func
import { fetchCategories } from 'providers/redux/reducers/fvCategory'
import { fetchPortal } from 'providers/redux/reducers/fvPortal'
import { pushWindowPath } from 'providers/redux/reducers/windowPath'

import selectn from 'selectn'
import ProviderHelpers from 'common/ProviderHelpers'
import NavigationHelpers from 'common/NavigationHelpers'

import CategoryList from 'views/components/Browsing/category-list'
import PromiseWrapper from 'views/components/Document/PromiseWrapper'

/**
 * Categories page for words
 */

const { func, object } = PropTypes
export class Categories extends Component {
  static propTypes = {
    action: func,
    routeParams: object.isRequired,
    // REDUX: reducers/state
    computeCategories: object.isRequired,
    computeDialect2: object.isRequired,
    properties: object.isRequired,
    // REDUX: actions/dispatch/func
    fetchCategories: func.isRequired,
    fetchPortal: func.isRequired,
    pushWindowPath: func.isRequired,
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      pathOrId: null,
      filteredList: null,
      open: false,
      categoriesPath: null,
    }

    // Bind methods to 'this'
    ;['_onNavigateRequest'].forEach((method) => (this[method] = this[method].bind(this)))
  }

  fetchData(newProps) {
    // const pathOrId = '/' + newProps.properties.domain + '/' + newProps.routeParams.area
    const categoriesPath = '/api/v1/path/' + newProps.routeParams.dialect_path + '/Categories/@children'

    newProps.fetchPortal(newProps.routeParams.dialect_path + '/Portal')
    newProps.fetchCategories(categoriesPath)
    this.setState({ categoriesPath })
  }

  // Fetch data on initial render
  componentDidMount() {
    this.fetchData(this.props)
  }

  // Refetch data on URL change
  componentWillReceiveProps(nextProps) {
    if (nextProps.routeParams.area != this.props.routeParams.area) {
      this.fetchData(nextProps)
    }
  }

  _onNavigateRequest(category) {
    if (this.props.action) {
      this.props.action(category)
    } else {
      NavigationHelpers.navigate(
        '/' +
          this.props.routeParams.siteTheme +
          this.props.routeParams.dialect_path +
          '/learn/words/categories/' +
          category.uid,
        this.props.pushWindowPath,
        true
      )
    }
  }

  render() {
    const computeEntities = Immutable.fromJS([
      {
        id: this.state.categoriesPath,
        entity: this.props.computeCategories,
      },
    ])

    const _computeCategories = ProviderHelpers.getEntry(this.props.computeCategories, this.state.categoriesPath)

    return (
      <PromiseWrapper renderOnError computeEntities={computeEntities}>
        <div className="row">
          <div className="col-xs-12">
            <CategoryList
              action={this._onNavigateRequest}
              items={selectn('response.entries', _computeCategories)}
              cols={6}
            />
          </div>
        </div>
      </PromiseWrapper>
    )
  }
}

// REDUX: reducers/state
const mapStateToProps = (state /*, ownProps*/) => {
  const { fvCategory, fvDialect, navigation } = state

  const { properties } = navigation
  const { computeCategories } = fvCategory
  const { computeDialect2 } = fvDialect

  return {
    computeCategories,
    computeDialect2,
    properties,
  }
}

// REDUX: actions/dispatch/func
const mapDispatchToProps = {
  fetchCategories,
  fetchPortal,
  pushWindowPath,
}

export default connect(mapStateToProps, mapDispatchToProps)(Categories)
