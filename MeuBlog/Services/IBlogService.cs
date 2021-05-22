using System.Collections.Generic;
using MeuBlog.Models;

namespace MeuBlog.Services
{
    public interface IBlogService
    {
        string GetPostText(string link);
        IEnumerable<BlogPost> GetLatestPosts();
        IEnumerable<BlogPost> GetOlderPosts(int oldestPostId);
    }
}