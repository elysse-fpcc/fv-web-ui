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
import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import provide from 'react-redux-provide';
import ConfGlobal from 'conf/local.json';
import selectn from 'selectn';

import ProviderHelpers from 'common/ProviderHelpers';

// Views
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarSeparator from 'material-ui/lib/toolbar/toolbar-separator';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import Toggle from 'material-ui/lib/toggle';

import IconMenu from 'material-ui/lib/menus/icon-menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import IconButton from 'material-ui/lib/icon-button';
import NavigationExpandMoreIcon from 'material-ui/lib/svg-icons/navigation/expand-more';
import Paper from 'material-ui/lib/paper';
import {List, ListItem} from 'material-ui/lib/lists';
import CircularProgress from 'material-ui/lib/circular-progress';
import Snackbar from 'material-ui/lib/snackbar';

import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';

import EditableComponent from 'views/components/Editor/EditableComponent';
import Link from 'views/components/Document/Link';
import AuthorizationFilter from 'views/components/Document/AuthorizationFilter';

class EditableComponentHelper extends Component {
  render() {
    if (this.props.isSection) {
      return <div dangerouslySetInnerHTML={{__html: this.props.entity.get(this.props.property)}}></div>;
    }

    return <EditableComponent {...this.props} />;
  }
}

/**
* Dialect portal page showing all the various components of this dialect.
*/
@provide
export default class ExploreDialect extends Component {

  static propTypes = {
    properties: PropTypes.object.isRequired,
    windowPath: PropTypes.string.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    replaceWindowPath: PropTypes.func.isRequired,
    fetchDialect: PropTypes.func.isRequired,
    computeDialect: PropTypes.object.isRequired,
    updateDialect: PropTypes.func.isRequired,
    fetchPortal: PropTypes.func.isRequired,
    computePortal: PropTypes.object.isRequired,
    updatePortal: PropTypes.func.isRequired,
    fetchDirectory: PropTypes.func.isRequired,
    computeDirectory: PropTypes.object.isRequired,
    computeLogin: PropTypes.object.isRequired,
    publishDocument: PropTypes.func.isRequired,
    disableDocument: PropTypes.func.isRequired,
    computeDocumentDisable: PropTypes.object.isRequired,
    enableDocument: PropTypes.func.isRequired,
    computeDocumentEnable: PropTypes.object.isRequired,
    publishDialect: PropTypes.func.isRequired,
    computeDialectPublish: PropTypes.object.isRequired,
    unpublishDialect: PropTypes.func.isRequired,
    computeDialectUnpublish: PropTypes.object.isRequired,
    computePublish: PropTypes.object.isRequired,
    routeParams: PropTypes.object.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  constructor(props, context){
    super(props, context);

    this.state = {
      enabledToggled: null,
      publishedToggled: null
    };

    // Bind methods to 'this'
    ['_onNavigateRequest', '_handleDialectSearchSubmit', '_onSwitchAreaRequest', '_portalActionsPublish', '_dialectActionsToggleEnabled', '_dialectActionsTogglePublished'].forEach( (method => this[method] = this[method].bind(this)) );
  }

  fetchData(newProps) {
    newProps.fetchDialect(newProps.routeParams.dialect_path);
    newProps.fetchPortal(newProps.routeParams.dialect_path + '/Portal');
    newProps.fetchDirectory('fv_countries');
  }

  // Fetch data on initial render
  componentDidMount() {
    this.fetchData(this.props);
  }

  // Refetch data on URL change
  componentWillReceiveProps(nextProps) {
    if (nextProps.windowPath !== this.props.windowPath) {
      this.fetchData(nextProps);
    }

    if (nextProps.computeLogin.success !== this.props.computeLogin.success) {
      this.fetchData(nextProps);
    }
  }

  _onNavigateRequest(path) {
    this.props.pushWindowPath(path);
  }

  _onSwitchAreaRequest(e, index, value) {
    this._onNavigateRequest(this.props.windowPath.replace((value == 'sections') ? 'Workspaces' : 'sections', value));
  }

  /**
  * Publish the portal and dialect
  */
  _portalActionsPublish() {
    // Publish the portal
	  this.props.publishDocument(this.props.routeParams.dialect_path + '/Portal', this.props.routeParams.dialect_path.replace('Workspaces', 'sections'));

    // Publish the dialect
    this.props.publishDocument(this.props.routeParams.dialect_path, this.props.routeParams.language_path.replace('Workspaces', 'sections'));

    // Refetch
    this.fetchData(this.props);
  }

  /**
  * Toggle dialect (enabled/disabled)
  */
  _dialectActionsToggleEnabled(event, toggled) {
    if (toggled) {
      this.props.enableDocument(this.props.routeParams.dialect_path);
      this.setState({
        enabledToggled: true
      });
    } else {
      this.props.disableDocument(this.props.routeParams.dialect_path);
      this.setState({
        enabledToggled: false
      });
    }
  }

  /**
  * Toggle published dialect
  */
  _dialectActionsTogglePublished(event, toggled) {
    if (toggled) {
      this.props.publishDialect(this.props.routeParams.dialect_path);
      this.setState({
        publishedToggled: true
      });
    } else {
      this.props.unpublishDialect(this.props.routeParams.dialect_path);
      this.setState({
        publishedToggled: false
      });
    }
  }


  _handleDialectSearchSubmit() {
	  let queryParam = this.refs.dialectSearchField.getValue();	    
      // Clear out the input field
      //this.refs.dialectSearchField.setValue("");
	  this.props.replaceWindowPath(this.props.windowPath + '/search/' + queryParam); 
  }   
  
  render() {

    const { computeDialect, computePortal, splitWindowPath, computePublish } = this.props;
    const isSection = this.props.routeParams.area === 'sections';

    let dialect = computeDialect.response;
    let portal = computePortal.response;

    //debug = <pre>{JSON.stringify(portal, null, 4)}</pre>;

    if (computeDialect.isFetching || computePortal.isFetching) {
      return <CircularProgress mode="indeterminate" size={5} />;
    }

    if (computeDialect.isError) {
      return <div>{computeDialect.error}</div>;
    }

    if (computePublish.isFetching) {
        return <CircularProgress mode="indeterminate" size={5} />;
    }    

    let portalBackgroundImagePath = "/assets/images/cover.png";

    if (selectn('contextParameters.portal.fv-portal:background_top_image', portal)) {
    	portalBackgroundImagePath = ConfGlobal.baseURL + selectn('contextParameters.portal.fv-portal:background_top_image.path', portal);
    }
    
    let portalBackgroundStyles = {
    	position: 'relative',
    	minHeight: '200px',
    	backgroundColor: 'transparent',
      backgroundSize: 'cover',
    	backgroundImage: 'url("' + portalBackgroundImagePath + '")',
    	backgroundPosition: '0 0',
    }    

    let toolbarGroupItem = {
      float: 'left',
      margin: `${(this.context.muiTheme.toolbar.height - this.context.muiTheme.button.height) / 2}px ${this.context.muiTheme.baseTheme.spacing.desktopGutter}px`,
      position: 'relative'
    }

    const dialectEnabled = (this.state.enabledToggled == null) ? (dialect.state == 'Enabled') : this.state.enabledToggled;
    const dialectPublished = (this.state.publishedToggled == null) ? (dialect.state == 'Published') : this.state.publishedToggled;

    return <div>

            <div className="page-header" style={{minHeight: '100px', marginTop: '15px'}}>
              {(selectn('contextParameters.portal.fv-portal:logo', portal)) ? 
                <img className="pull-left" style={{maxHeight: '100px'}} src={ConfGlobal.baseURL + selectn('contextParameters.portal.fv-portal:logo', portal).path} /> : ''
              }
              <h1>{dialect.get('dc:title')} Community Portal</h1>
              <div>
                <span className={classNames('label', 'label-primary')}><strong>543</strong> Words</span> <span className={classNames('label', 'label-primary')}><strong>143</strong> Phrases</span> <span className={classNames('label', 'label-primary')}><strong>243</strong> Songs</span> <span className={classNames('label', 'label-primary')}><strong>43</strong> Stories</span> 
              </div>
            </div>

            {(() => {
              if (this.props.routeParams.area == 'Workspaces') {
                
                return <Toolbar>

                  <ToolbarGroup float="right">

                    <AuthorizationFilter filter={{permission: 'Write', entity: dialect}} style={toolbarGroupItem}>
                      <div style={{display:'inline-block', float: 'left', margin: '17px 5px 10px 5px', position:'relative'}}>
                        <Toggle
                          toggled={dialectEnabled || dialectPublished}
                          onToggle={this._dialectActionsToggleEnabled}
                          ref="enabled"
                          disabled={dialectPublished}
                          name="enabled"
                          value="enabled"
                          label="Enabled"/>
                      </div>
                    </AuthorizationFilter>

                    <AuthorizationFilter filter={{permission: 'Write', entity: dialect}} style={toolbarGroupItem}>
                      <div style={{display:'inline-block', float: 'left', margin: '17px 5px 10px 5px', position:'relative'}}>
                        <Toggle
                          toggled={dialectPublished}
                          onToggle={this._dialectActionsTogglePublished}
                          disabled={!dialectEnabled && !dialectPublished}
                          name="published"
                          value="published"
                          label="Published"/>
                      </div>
                    </AuthorizationFilter>

                    <AuthorizationFilter filter={{permission: 'Write', entity: dialect}} style={toolbarGroupItem}>
                      <RaisedButton disabled={!dialectPublished} label="Publish Changes" style={{marginRight: '5px', marginLeft: '0'}} secondary={true} onTouchTap={this._portalActionsPublish} />
                    </AuthorizationFilter>

                    <AuthorizationFilter filter={{permission: 'Write', entity: dialect}} style={toolbarGroupItem}>
                      <RaisedButton label="Edit Portal" style={{marginRight: '5px', marginLeft: '0'}} primary={true} onTouchTap={this._onNavigateRequest.bind(this, this.props.windowPath.replace('sections', 'Workspaces') + '/edit')} />
                    </AuthorizationFilter>

                    <ToolbarSeparator />

                    <IconMenu iconButtonElement={
                      <IconButton tooltip="More Options" touch={true}>
                        <NavigationExpandMoreIcon />
                      </IconButton>
                    }>
                      <MenuItem onTouchTap={this._onNavigateRequest.bind(this, this.props.windowPath + '/reports')} primaryText="Reports" />
                    </IconMenu>
                  </ToolbarGroup>

                </Toolbar>;
              }
            })()}

            <div style={portalBackgroundStyles}>
            
              <h2 style={{float: 'left', backgroundColor: 'rgba(255,255,255, 0.3)'}}>
                <AuthorizationFilter filter={{permission: 'Write', entity: dialect}} renderPartial={true}>
                  <EditableComponentHelper isSection={isSection} computeEntity={computePortal} updateEntity={this.props.updatePortal} property="fv-portal:greeting" entity={portal} />
                </AuthorizationFilter>
              </h2>

              <div className="pull-right" style={{"width":"200px","height":"175px","background":"rgba(255, 255, 255, 0.7)","margin":"10px 25px","borderRadius":"10px","padding":"10px"}}>
                <div>
                  <strong>Name of Archive</strong>: 
                    <AuthorizationFilter filter={{permission: 'Write', entity: dialect}} renderPartial={true}>
                      <EditableComponentHelper isSection={isSection} computeEntity={computeDialect} updateEntity={this.props.updateDialect} property="dc:title" entity={dialect} />
                    </AuthorizationFilter>
                  </div>

                  <hr style={{margin: "5px 0"}} />

                  <div>
                    <strong>Country</strong><br/>
                    <AuthorizationFilter filter={{permission: 'Write', entity: dialect}} renderPartial={true}>
                      <EditableComponentHelper isSection={isSection} computeEntity={computeDialect} updateEntity={this.props.updateDialect} property="fvdialect:country" entity={dialect} />
                    </AuthorizationFilter>
                  </div>

                  <hr style={{margin: "5px 0"}} />

                  <p><strong>Region</strong><br/>{dialect.get('fvdialect:region')}</p>
              </div>

              <div>
                {(selectn('contextParameters.portal.fv-portal:featured_audio', portal)) ? 
                 <audio id="portalFeaturedAudio" src={ConfGlobal.baseURL + selectn('contextParameters.portal.fv-portal:featured_audio', portal).path} controls />
                : ''}
              </div>

            </div>

            <Toolbar>

              <ToolbarGroup firstChild={true} float="left">
                <RaisedButton onTouchTap={this._onNavigateRequest.bind(this, this.props.windowPath + '/learn')} label="Learn" /> 
                <RaisedButton onTouchTap={this._onNavigateRequest.bind(this, this.props.windowPath + '/play')} label="Play" /> 
                <RaisedButton onTouchTap={this._onNavigateRequest.bind(this, this.props.windowPath + '/gallery/Community Slideshow')} label="Community Slideshow" /> 
                <RaisedButton onTouchTap={this._onNavigateRequest.bind(this, this.props.windowPath + '/gallery/Art Gallery')} label="Art Gallery" />

                {/*<RaisedButton onTouchTap={this._onNavigateRequest.bind(this, this.props.windowPath + '/search')} label="Search Within Dialect" /> */}
                <TextField ref="dialectSearchField" hintText="Search dialect..." onEnterKeyDown={this._handleDialectSearchSubmit} />

              </ToolbarGroup>

            </Toolbar>

            <div className="row" style={{marginTop: '15px'}}>

              <div className={classNames('col-xs-9', 'col-md-10')}>
                <div>
                  <AuthorizationFilter filter={{permission: 'Write', entity: dialect}} renderPartial={true}>
                    <EditableComponentHelper isSection={isSection} computeEntity={computePortal} updateEntity={this.props.updatePortal} property="fv-portal:about" entity={portal} />
                  </AuthorizationFilter>
                </div>
              </div>

              <div className={classNames('col-xs-3', 'col-md-2')}>

                {(() => {

                  const featuredWords = selectn('contextParameters.portal.fv-portal:featured_words', portal);

                  if (featuredWords && featuredWords.length > 0) {

                      return <Paper style={{padding: '25px', marginBottom: '20px'}} zDepth={2}>

                            <strong><span>First Words</span></strong><br />

                            {(featuredWords || []).map((word, i) =>
                              <div key={i}>
                                <strong><a href={'/explore' + word.path}>{word['dc:title']}</a></strong>
                                {(word['fv:related_audio'][0]) ? 
                                    <audio src={ConfGlobal.baseURL + word['fv:related_audio'][0].path} controls />
                                : ''}
                                <br />
                                <span>{word['fv-word:part_of_speech']}</span><br />
                                {word['fv:literal_translation'].map((wordTranslation, j) =>
                                  <span key={j}>
                                    {wordTranslation.language}<br />
                                    {wordTranslation.translation}
                                  </span>
                                )}
                                <br /><br />
                              </div>
                            )} 
                            
                          </Paper>;
                    }

                  })()}

                  {(() => {

                    const relatedLinks = selectn('contextParameters.portal.fv-portal:related_links', portal);

                    if (relatedLinks && relatedLinks.length > 0) {

                        return <Paper style={{padding: '25px', marginBottom: '20px'}} zDepth={2}>

                              <strong><span>Related Links</span></strong><br />

                              {(relatedLinks || []).map((link, i) =>
                                <Link key={i} data={link} showDescription={false} />
                              )} 
                              
                            </Paper>;
                      }

                    })()}

              </div>

          </div>
        </div>;
  }
}