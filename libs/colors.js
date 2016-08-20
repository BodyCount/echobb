
var colors = ['26C6DA', 'ef5350', 'EC407A', 'AB47BC', '7E57C2', '5C6BC0', '42A5F5', '29B6F6', '26C6DA', '26A69A'];

module.exports = {

	getRandomColor: function(){
    var element = Math.floor(Math.random() * (colors.length + 1));
    return colors[element]
	}
}