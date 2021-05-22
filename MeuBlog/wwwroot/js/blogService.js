define([
  "./template.js",
  "../lib/showdown/showdown.js",
  "./clientStorage.js",
], function (template, showdown, clientStorage) {
  const blogLatestPostsUrl = "/Home/LatestBlogPosts/";
  const blogPostUrl = "/Home/Post/?link=";
  const blogMorePostsUrl = "/Home/MoreBlogPosts/?oldestBlogPostId=";
  let oldestBlogPostId = 0;

  function fetchPromise(url, link, text) {
    link = link || "";

    return new Promise((resolve) => {
      fetch(url + link)
        .then(function (data) {
          var resolveSuccess = () =>
            resolve("The connection is OK, showing latest results");

          if (text) {
            data
              .text()
              .then((text) =>
                clientStorage.addPostText(link, text).then(resolveSuccess)
              );
          } else {
            data
              .json()
              .then((jsonData) =>
                clientStorage.addPosts(jsonData).then(resolveSuccess)
              );
          }
        })
        .catch((e) => resolve("No connection, showing offline results"));

      setTimeout(
        () => resolve("The connection is hanging, showing offline results"),
        1100
      );
    });
  }

  function setOldestBlogPostId(data) {
    const ids = data.map((item) => item.postId);
    oldestBlogPostId = Math.min(...ids);
  }

  function loadLatestBlogPosts() {
    loadData(blogLatestPostsUrl);
  }

  function loadData(url) {
    fetchPromise(url).then((status) => {
      document.querySelector("#connection-status").innerHTML = status;

      clientStorage.getPosts().then((posts) => template.appendBlogList(posts));
    });
  }

  function loadMoreBlogPosts() {
    loadData(blogMorePostsUrl + clientStorage.getOldestBlogPostId());
  }

  function loadBlogPost(link) {
    fetchPromise(blogPostUrl, link, true).then((status) => {
      document.querySelector("#connection-status").innerHTML = status;
      clientStorage.getPostText(link).then((data) => {
        if (!data) {
          const htmlStr = document
            .querySelector("#blog-content-not-found")
            .innerHTML.replace(/{{Link}}/g, link);

          template.showBlogItem(htmlStr, link);
        } else {
          const converter = new showdown.Converter();
          html = converter.makeHtml(data);
          template.showBlogItem(html, link);
          window.location = "#" + link;
        }
      });
    });
  }

  return {
    loadLatestBlogPosts,
    loadBlogPost,
    loadMoreBlogPosts,
  };
});
