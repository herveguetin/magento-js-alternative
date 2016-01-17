import Handlebars from 'handlebars';

Handlebars.JavaScriptCompiler.prototype.nameLookup = function(parent, name, type) {
    var result = '(' + parent + ' instanceof Backbone.Model ? ' + parent + '.get("' + name + '") : ' + parent;
    if (/^[0-9]+$/.test(name)) {
        return result + "[" + name + "])";
    } else if (Handlebars.JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
        return result + "." + name + ')';
    } else {
        return result + "['" + name + "'])";
    }
};