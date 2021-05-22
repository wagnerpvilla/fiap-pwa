using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MeuBlog.Models;
using MeuBlog.Services;

namespace MeuBlog.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IBlogService service;

        public HomeController(ILogger<HomeController> logger, IBlogService service)
        {
            _logger = logger;
            this.service = service;
        }

        public IActionResult Index()
        {

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public JsonResult LatestBlogPosts()
        {
            var posts = this.service.GetLatestPosts();

            return Json(posts);
        }

        public ContentResult Post(string link)
        {
            return Content(this.service.GetPostText(link));
        }

        public JsonResult MoreBlogPosts(int oldestBlogPostId)
        {
            var posts = this.service.GetOlderPosts(oldestBlogPostId);
            return Json(posts);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel
            {
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
            });
        }
    }
}
