export {getEditableDecorator}


const getEditableDecorator = (handleInputChange) => {
    const textEditHandler = handleInputChange; 
    return (d, field) => makeEditable(d,field, textEditHandler)
}

// copied from http://bl.ocks.org/GerHobbelt/2653660
function makeEditable(d, field, textEditHandler) { // field is an array [svgElementId, valueToEdit, fieldIdentifier]

    const svgElementId = arguments[1][0]
    const valueToEdit = arguments[1][1]
    const fieldIdentifier = arguments[1][2]
    d // decorate element with event handlers
        .on("mouseover", function () {
            d3.select(this).style("fill", "red");
        })
        .on("mouseout", function () {
            d3.select(this).style("fill", null); // TODO reset fill style to previous value, not reset to null
        })
        .on("click", function (d) {
            //            var p = this.parentNode;

            // inject a HTML form to edit the content here...

            const svg = d3.select(svgElementId)
            var frm = svg.append("foreignObject");

            var inp = frm
                .attr("x", d.layerX) // use x and y coordinates from mouse event // TODO for use in size/color/shape - the location needs to be derived differently 
                .attr("y", d.layerY)

                .attr("width", 300)
                .attr("height", 25)
                .append("xhtml:form")
                .append("input")
                .attr("title", "Edit value, then press tab or click outside of field")
                .attr("value", function () {
                    // nasty spot to place this call, but here we are sure that the <input> tag is available
                    // and is handily pointed at by 'this':
                    this.focus();
                    return valueToEdit;
                })
                .attr("style", "width: 294px;")
                // make the form go away when you jump out (form looses focus) or hit ENTER:
                .on("blur", function () {
                    const txt = inp.node().value;
                    textEditHandler(fieldIdentifier, txt)
                    // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
                    svg.select("foreignObject").remove();
                })
                .on("keypress", function () {
                    // IE fix
                    if (!d3.event)
                        d3.event = window.event;

                    const e = d3.event;
                    if (e.keyCode == 13) {
                        if (typeof (e.cancelBubble) !== 'undefined') // IE
                            e.cancelBubble = true;
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();

                        const txt = inp.node().value;
                        textEditHandler(fieldIdentifier, txt)

                        // odd. Should work in Safari, but the debugger crashes on this instead.
                        // Anyway, it SHOULD be here and it doesn't hurt otherwise.
                        svg.select("foreignObject").remove();
                    }
                });
        });
}

