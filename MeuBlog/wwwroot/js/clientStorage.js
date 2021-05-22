define([], function () {
  const blogInstance = localforage.createInstance({
    name: "blog",
  });

  let oldestBlogPostId = null;
  const limit = 3;

  function addPosts(posts) {
    return new Promise((resolve) => {
      const keyValuePair = posts
        .map((item) => ({
          key: String(item.postId),
          value: item,
        }))
        .sort((a, b) => a.key - b.key);

      blogInstance.setItems(keyValuePair).then(() => resolve());
    });
  }

  function getPostText(link) {
    return new Promise((resolve) => {
      blogInstance.getItem("#" + link).then((text) => {
        resolve(text);
      });
    });
  }

  function addPostText(link, text) {
    return new Promise((resolve) => {
      blogInstance.setItem("#" + link, text).then(() => {
        resolve();
      });
    });
  }

  function getPosts() {
    return new Promise((resolve) => {
      blogInstance.keys().then((keys) => {
        keys = keys.filter((a) => a && !a.includes("#")).sort((a, b) => a - b);

        let index = keys.indexOf(String(oldestBlogPostId));
        if (index == -1) {
          index = keys.length;
        }

        if (index == 0) {
          resolve([]);
          return;
        }

        const start = index - limit;
        const limitAdjusted = start < 0 ? index : limit;

        keys = keys.splice(Math.max(0, start), limitAdjusted);

        blogInstance.getItems(keys).then((results) => {
          const posts = Object.keys(results)
            .map((k) => results[k])
            .reverse();
          oldestBlogPostId = String(posts[posts.length - 1].postId);
          resolve(posts);
        });
      });
    });
  }

  function getOldestBlogPostId() {
    return oldestBlogPostId;
  }

  return { addPosts, getPosts, getOldestBlogPostId, addPostText, getPostText };
});
