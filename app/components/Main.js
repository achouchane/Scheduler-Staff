var React = require("react");
var helpers = require("./utils/helpers");

var Main = React.createClass({
    render: function() {
        return (
            <div>
                HERE
                {this.props.children}
            </div>
        );
    }
});

module.exports = Main;