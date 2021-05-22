using System;

namespace MeuBlog.Models
{
    public class BlogPost
    {
        public int PostId { get; set; }
        public string Title { get; set; }
        public string ShortDescription { get; set; }
        public string Link => this.Title.UrlFriendly(50);

    }
}