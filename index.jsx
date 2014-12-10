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
                Current value: {VALUE}

                <Slider tickStep={10} style={firstStyle}
                    onDrag={this.onChange} value={VALUE}/>

                <Slider
                    orientation="vertical"
                    tickStep={5}
                    onDrag={this.onChange} value={VALUE}/>

                <Slider
                    trackRadius={20}
                    tickStep={30}
                    trackStyle={{height: 4}}
                    trackFillStyle={{backgroundColor: 'red'}}
                    handleSize={20}
                    style={{padding: 10, width: 200}}
                    onDrag={this.onChange} value={VALUE}/>
            </div>
        )
    }
})

React.render(<App />, document.getElementById('content'))