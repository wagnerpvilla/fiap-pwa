using System.Collections.Generic;
using System.IO;
using System.Linq;
using MeuBlog.Models;
using Microsoft.AspNetCore.Hosting;

namespace MeuBlog.Services
{
    public class BlogService : IBlogService
    {

        private readonly IHostingEnvironment env;

        public BlogService(IHostingEnvironment env)
        {
            this.env = env;
        }

        private IEnumerable<BlogPost> Posts
        {
            get
            {

                return Enumerable.Range(0, 15).Select(i => new BlogPost()
                {
                    PostId = i,
                    Title = $"Title {i}",
                    ShortDescription = $"ShortDescription {i}",
                });

            }
        }

        public IEnumerable<BlogPost> GetLatestPosts()
            => Posts.OrderByDescending(p => p.PostId).Take(3);

        public IEnumerable<BlogPost> GetOlderPosts(int oldestPostId)
        {
            var posts = Posts.Where(p => p.PostId < oldestPostId)
                .OrderByDescending(p => p.PostId);

            if (posts.Count() < 3)
            {
                return posts;
            }
            return posts.Take(3);
        }

        public string GetPostText(string link)
        {
            var post = Posts.FirstOrDefault(p => p.Link == link);

            return File.ReadAllText($"{env.WebRootPath}/Posts/{post.PostId}_post.md");

        }
    }
}