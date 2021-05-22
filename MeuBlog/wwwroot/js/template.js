define([], function () {
  function generateBlogItem(item) {
    let template = document.querySelector("#blog-card").innerHTML;
    template = template.replace("{{PostId}}", item.postId);
    template = template.replace("{{Title}}", item.title);
    template = template.replace("{{ShortDescription}}", item.shortDescription);
    template = template.replace("{{Link}}", item.link);
    return template;
  }

  function appendBlogList(items) {
    let cardHtml = "";
    for (let i = 0; i < items.length; i++) {
      cardHtml += generateBlogItem(items[i]);
    }
    $(".blog-list").append(cardHtml);
  }

  function showBlogItem(html, link, size) {
    let template = document.querySelector("#blog-item").innerHTML;
    template = template.replace("{{Link}}", link);
    template = template.replace("{{Link}}", link);
    template = template.replace("{{Link}}", link);
    template = template.replace("{{Link}}", link);
    template = template.replace("{{Content}}", html);
    template = template.replace("{{Size}}", size);
    document.querySelector("#blog-item-container").innerHTML = template;
    document.querySelector(".blog-item-close").addEventListener("click", () => {
      document.getElementById("blog-item-container").innerHTML = "";
    });
  }

  return { generateBlogItem, appendBlogList, showBlogItem };
});
