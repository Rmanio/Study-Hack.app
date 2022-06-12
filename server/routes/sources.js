const express = require('express');
const ShortUrl = require('../models/shortUrl')
const router = express.Router()

const {ensureAuthenticated} = require('../../config/auth');


//URL Shortener
router.get('/', ensureAuthenticated, async (req, res) => {
    const shortUrls = await ShortUrl.find().sort({clicks: -1, name: 1})
    res.render('sources', {
        shortUrls: shortUrls,
        user: req.user
    });
})

router.post('/shortUrls', ensureAuthenticated, async (req, res) => {
    await ShortUrl.create({ name: req.body.wName, full: req.body.fullUrl })

    res.redirect('/sources')
})

router.get('/:shortUrl', ensureAuthenticated, async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) return res.sendStatus(404)

    shortUrl.clicks++
    shortUrl.save()

    res.redirect(shortUrl.full)
})
//-------------------------------

module.exports = router;