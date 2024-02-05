export function paginate(req, res, next) {
    const pageNumber = req.query.pageNumber;
    const pageSize = req.query.pageSize;
    if (pageSize && pageNumber) {
      const offset = pageSize * (pageNumber - 1);
      const limit = pageSize;
      req.offset = offset;
      req.limit = Number(limit);
      next();
    } else {
      req.offset = 0
      req.limit= 200
      next()
    }
  }