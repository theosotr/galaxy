/** This class renders the chart type selection grid. */
define( [ 'utils/utils', 'mvc/ui/ui-misc', 'mvc/ui/ui-tabs' ], function( Utils, Ui, Tabs ) {
    return Backbone.View.extend({
        events : {
            'click .item'    : '_onclick',
            'dblclick .item' : '_ondblclick'
        },

        initialize : function( app, options ) {
            var self = this;
            this.app = app;
            this.options = Utils.merge( options, this.optionsDefault );
            this.tabs = new Tabs.View( {} );
            this.setElement( this.tabs.$el.addClass( 'charts-types' ) );
            this.render();
        },

        render: function() {
            this.tabs.delAll();
            this._renderDefault();
            this._renderList();
        },

        _renderDefault: function() {
            var self = this;
            var index = {};
            this.first = null;
            _.each( this.app.types, function( type, type_id ) {
                if ( !type.datatypes || type.datatypes.indexOf( self.app.dataset.file_ext ) != -1  ) {
                    if ( type.keywords.indexOf( 'default' ) !== -1 ) {
                        index[ type.category ] = index[ type.category ] || {};
                        index[ type.category ][ type_id ] = type;
                    }
                }
            });
            if ( _.size( index ) > 0 ) {
                var filtered = [];
                _.each( index, function( category, category_header ) {
                    var subset = { title: category_header, list:[] };
                    _.each( category, function( type, type_id ) {
                        subset.list.push({
                            id      : type_id,
                            title   : ( type.zoomable ? '<span class="fa fa-search-plus"/>' : '' ) + type.title + ' (' + type.library + ')',
                            url     : remote_root + 'src/visualizations/' + self.app.split( type_id ) + '/logo.png'
                        });
                    });
                    filtered.push( subset );
                });
                var $el = $( '<div/>' ).addClass( 'charts-grid' );
                _.each( filtered, function( category ) {
                    $el.append( $( '<div/>' ).addClass( 'header ui-margin-top' ).html( '&bull;&nbsp;' + category.title ) );
                    _.each( category.list, function( type ) {
                        self.first = self.first || type.id;
                        $el.append( self._templateThumbnailItem( type ) );
                    });
                });
                this.tabs.add( { id: Utils.uid(), title: 'Suggested visualizations', $el: $el } );
            }
        },

        _renderList: function() {
            var self = this;
            var index = [];
            _.each( this.app.types, function( type, type_id ) {
                if ( !type.datatypes || type.datatypes.indexOf( self.app.dataset.file_ext ) != -1  ) {
                    index.push( {
                        id          : type_id,
                        title       : ( type.zoomable ? '<span class="fa fa-search-plus"/>' : '' ) + type.title + ' (' + type.library + ')',
                        sortby      : type.title,
                        description : type.description || type.category,
                        url         : remote_root + 'src/visualizations/' + self.app.split( type_id ) + '/logo.png'
                    });
                }
            });
            if ( index.length > 0 ) {
                index.sort( function( a, b ) { return a.sortby < b.sortby ? -1 : 1 } );
                this.first = this.first || index[ 0 ].id;
                var $el = $( '<div/>' ).addClass( 'charts-grid' );
                _.each( index, function( d, i ) {
                    $el.append( self._templateRegularItem( d ) );
                });
                this.tabs.add({ id: Utils.uid(), title: 'List of all visualizations', $el: $el } );
            }
        },

        /** Set/Get selected chart type */
        value: function( new_value ) {
            if ( new_value == '__first' ) {
                new_value = this.first;
            }
            var before = this.$( '.current' ).attr( 'chart_id' );
            if ( new_value !== undefined ) {
                this.$( '.current' ).removeClass( 'current' );
                this.$( '[chart_id="' + new_value + '"]' ).addClass( 'current' );
            }
            var after = this.$( '.current' ).attr( 'chart_id' );
            if( after !== undefined ) {
                if ( after != before && this.options.onchange ) {
                    this.options.onchange( after );
                }
                return after;
            }
        },

        /** Add click handler */
        _onclick: function( e ) {
            this.value( $( e.target ).closest( '.item' ).attr( 'chart_id' ) );
        },

        /** Add double click handler */
        _ondblclick: function( e ) {
            this.options.ondblclick && this.options.ondblclick( this.value() );
        },

        /* Chart type template with image */
        _templateThumbnailItem: function( options ) {
            return  '<div class="item item-float" chart_id="' + options.id + '">' +
                        '<img class="image" src="' + options.url + '">' +
                        '<div class="title ui-form-info">' + options.title + '</div>' +
                    '<div>';
        },

        /* Chart type template with image */
        _templateRegularItem: function( options ) {
            return  '<div class="item" chart_id="' + options.id + '">' +
                        '<table>' +
                            '<tr>' +
                                '<td>' +
                                    '<img class="image" src="' + options.url + '">' +
                                '</td>' +
                                '<td>' +
                                    '<div class="charts-description-title ui-form-info">' + options.title + '</div>' +
                                    '<div class="charts-description-text ui-form-info">' + options.description + '</div>' +
                                '</td>' +
                            '</tr>' +
                    '<div>';
        }
    });
});
