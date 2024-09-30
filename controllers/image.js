const handleImage = (pgdb, returnClarifyRequestOption) => (req, res) => {
    const {id, imageUrl} = req.body;

    let imageRes = {
        count: 0,
        faceBox: []
    }

    if(id){
        
        pgdb('users')
        .where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(result => {

            imageRes.count = result[0].entries;

            fetch("https://api.clarifai.com/v2/models/face-detection/outputs", returnClarifyRequestOption(imageUrl))
            .then(response => response.json())
            .then(result => {
    
                const regions = result.outputs[0].data.regions;
    
                regions.forEach(region => {
                    // Accessing and rounding the bounding box values
                    const boundingBox = region.region_info.bounding_box;
                    const topRow = boundingBox.top_row.toFixed(3);
                    const leftCol = boundingBox.left_col.toFixed(3);
                    const bottomRow = boundingBox.bottom_row.toFixed(3);
                    const rightCol = boundingBox.right_col.toFixed(3);
    
                    region.data.concepts.forEach(concept => {
                        // Accessing and rounding the concept value
                        const name = concept.name;
                        const value = concept.value.toFixed(4);
    
                        imageRes.faceBox.push({
                            name: name,
                            value: value,
                            topRow: topRow,
                            leftCol: leftCol,
                            bottomRow: bottomRow,
                            rightCol: rightCol
                        })
    
                    });
                });
    
                return res.json(imageRes);
    
            })
            .catch(error => {
                res.status(400).json("Error detecting image.")
            });

        }).catch(err => res.status(400).json("Unable to get an entry."));

    }
}

module.exports = {
    handleImage: handleImage
}