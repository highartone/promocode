'use strict';
module.exports = function(app){

    /** Update special config into process memory */
    app.domainsObj = {};

    (function updateDomains(){
        app.Domains.getAll()
            .then(function(data){
                data[0]['domains'].forEach(function(domain){
                    app.domainsObj[domain] = true;
                });
                setTimeout(updateDomains,5*60*1000);
            })
            .fail(function (err) {
                console.log('Domains.getAll fail error: '+err);
                app.mongo.close();
            });
    })();
};