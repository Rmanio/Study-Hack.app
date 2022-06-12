const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const {ensureAuthenticated} = require("../../config/auth");

// All Authors Route
router.get('/', ensureAuthenticated, async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const authors = await Author.find(searchOptions)
    const ADMIN = ['yzADMIN@admin.com', 'dnADMIN@admin.com', 'anADMIN@admin.com', 'akADMIN@admin.com'];
    res.render('library/authors/index', {
      user:req.user,
      admin:ADMIN,
      layout: 'library/layouts/layout.ejs',
      authors: authors,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Author Route
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('library/authors/new', {
    layout: 'library/layouts/layout.ejs',
    author: new Author() })
})

// Create Author Route
router.post('/', ensureAuthenticated, async (req, res) => {
  const author = new Author({
    name: req.body.name,
    user_author: req.user
  })
  try {
    const newAuthor = await author.save()
    res.redirect(`authors/${newAuthor.id}`)
  } catch {
    res.render('library/authors/new', {
      layout: 'library/layouts/layout.ejs',
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    const books = await Book.find({ author: author.id }).limit(6).exec()
    const ADMIN = ['yzADMIN@admin.com', 'dnADMIN@admin.com', 'anADMIN@admin.com', 'akADMIN@admin.com'];
    res.render('library/authors/show', {
      admin:ADMIN,
      user:req.user,
      layout: 'library/layouts/layout.ejs',
      author: author,
      booksByAuthor: books
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    res.render('library/authors/edit', {
      layout: 'library/layouts/layout.ejs',
      author: author })
  } catch {
    res.redirect('/authors')
  }
})

router.put('/:id', ensureAuthenticated, async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    author.name = req.body.name
    await author.save()
    res.redirect(`/authors/${author.id}`)
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.render('library/authors/edit', {
        layout: 'library/layouts/layout.ejs',
        author: author,
        errorMessage: 'Error updating Author'
      })
    }
  }
})

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    await author.remove()
    res.redirect('/authors')
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.redirect(`/authors/${author.id}`)
    }
  }
})

module.exports = router