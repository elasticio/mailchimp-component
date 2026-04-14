exports.newMessageWithBody = (body) => ({
  id: new Date().getTime(),
  attachments: {},
  body,
  headers: {},
  metadata: {},
});

exports.newEmptyMessage = () => ({
  id: new Date().getTime(),
  attachments: {},
  body: {},
  headers: {},
  metadata: {},
});
