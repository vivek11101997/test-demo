import type { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
  const cursor = parseInt(req.query.cursor as string) || 0;
  const pageSize = 108;

  // 👇 Configurable maximum number
  const maxNumber = 1404;

  // 👇 Stop if cursor is beyond the maximum
  if (cursor > maxNumber) {
    return res.json({ data: [], nextId: null, previousId: cursor - pageSize });
  }

  // 👇 Limit page size to not go beyond maxNumber
  const limitedPageSize = Math.min(pageSize, maxNumber - cursor + 1);

  const data = Array(limitedPageSize)
    .fill(0)
    .map((_, i) => {
      return {
        name: "Project " + (i + cursor) + ` (server time: ${Date.now()})`,
        id: i + cursor,
      };
    });

  const lastId = data.length > 0 ? data[data.length - 1].id : null;
  const nextId = lastId !== null && lastId < maxNumber ? lastId + 1 : null;
  const previousId = cursor > 0 ? Math.max(cursor - pageSize, 0) : null;

  setTimeout(() => res.json({ data, nextId, previousId }), 1000);
};
