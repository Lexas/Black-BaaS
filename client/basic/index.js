/* Black BaaS demo
 * Distributed under an GPL_v4 license, please see LICENSE in the top dir.
 */

/*global requirejs, require*/

requirejs.config({
    baseUrl : '/',
    paths: {
        lib : '../lib',
        client: '../basic',
        jquery : '../lib/jquery',
        },
    map: {
        'lib': {
            backbone: 'lib/backbone'
        }
    }
});

require(['jquery', 'lib/backbone'], function($, Backbone){
    'use strict';

    function _init(){
        session.init();

        function retry(xhr, status /*, error */){
            /* jshint validthis:true */
            if(this.tryCount < this.maxTries){
                console.error('%s: %s... retrying', xhr, status);
                this.tryCount++;
                var self = this;
                setTimeout(function(){
                    $.ajax(self);
                }, 3000);
            }
            else{
                console.error("couldn't process request!");
                //ToDo: show some message dialog to the user
            }
        }

        /* If network timeout or internal server error, retry */
        $.ajaxSetup({
            tryCount: 0,
            maxTries: 3,
            statusCode: {
                408: retry,
                500: retry,
                504: retry,
                522: retry,
                524: retry,
                598: retry
            }
        });
    }

    /* To allow navigation that changes a URL without loading a new
     * page, all page main scripts return a function that sets up the new view 
     * (since just doing require(['foo']) will be a noop the second time it 
     * is called in a page).
     *
     * These scripts get the router, so they can listen to route
     * events to destroy their views, add new routes or request
     * navigation.
     */

    var router;
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": 'home',
            "admin(/)": 'admin',
            "users/:id/sources/": 'sources',
            "works(?:filters)(/)": 'works',
            "works/:id(/)": 'work',
            "works/:id/posts(/)": 'posts',
            "works/:id/sources(/)": 'sources',
            "login(/)": 'login'
        },
        admin: function(){
            require(['admin'], function(view) { view(router); });
        },
        home: function() {
            require(['home'], function(view) { view(router); });
        },
        login: function(){
            // require(['login'], function(view) { view(router); });
        },
        posts: function(id){
            require(['posts'], function(view) { view(router); });
        },
        sources: function(id){
            require(['sources'], function(view) { view(router, id); });
        },
        works: function(filters) {
            require(['browseWorks'], function(view) { view(router, filters); });
        },
        work: function (id) {
            require(['workPermalink'], function(view) { view(router, id); });
        }
    });

    router = new AppRouter();
    Backbone.history.start({pushState:true});

    if(document.readyState === 'complete'){
        _init();
    } else {
        document.onready = _init;
    }

    return;

});

