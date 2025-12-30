class APIFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    const queryOpj = { ...this.queryString }
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'lang']
    excludedFields.forEach((el) => delete queryOpj[el])

    let queryStr = JSON.stringify(queryOpj)
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|ne|regex)\b/g,
      (match) => `$${match}`
    )
    let i = 0
    while (queryStr.indexOf('regex', i) != -1) {
      // console.log(queryStr.indexOf('regex', i))
      const p = queryStr.indexOf('}', queryStr.indexOf('regex', i))
      queryStr = queryStr
        .slice(0, p)
        .concat(',"$options":"i"')
        .concat(queryStr.slice(p))
      i = queryStr.indexOf('regex', i) + 1
    }

    // console.log(queryStr)
    this.query = this.query.find(JSON.parse(queryStr))
    return this
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-CreatedAt')
    }
    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v') // every thing except { __v }
    }
    return this
  }
  paginate() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 10
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}
module.exports = APIFeatures
