'use strict';

var React = require('react')
var Slider = require('./src')

require('./index.styl')

var VALUE = 90

var App = React.createClass({

    onChange: function(value){
        VALUE = value
        this.setState({})
    },



    render: function() {

        var firstStyle = {
            height: 20
        }

        return (
            <div className="App" style={{padding: 10}}>
            {VALUE}
            <Slider tickStep={10} style={firstStyle}
                onDrag={this.onChange} value={VALUE}/>

            <Slider
                orientation="vertical"
                style={{}}
                onDrag={this.onChange} value={VALUE}/>

            <Slider trackRadius={10} handleHeight={10} tickStep={10} style={{padding: 10}}
                onDrag={this.onChange} value={VALUE}/>
            </div>
        )
    }
})

React.render(<App />, document.getElementById('content'))