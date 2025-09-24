const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next) => {
    async function forwardGeocode(query) {
        const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${process.env.MAP_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.features.length === 0) return null;

        return data.features[0]; // similar to geoData.body.features[0] in Mapbox SDK
    }
    const result = await forwardGeocode(req.body.listing.location);

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = result.geometry;
    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250/");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    async function forwardGeocode(query) {
        const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${process.env.MAP_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.features.length === 0) return null;

        return data.features[0]; // similar to geoData.body.features[0] in Mapbox SDK
    }
    const result = await forwardGeocode(req.body.listing.location);

    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
    }    

    if(req.body.listing.location) {
        if(result) {
            listing.geometry = result.geometry;
        }
    }
    
    await listing.save();

    req.flash("success", "Listing updated successfully.");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted succesfully.");
    res.redirect("/listings");
};