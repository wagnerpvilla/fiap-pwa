using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MeuBlog.Models;
using MeuBlog.Services;
using MeuBlog.Data;
using Lib.Net.Http.WebPush;
using System.Net;

namespace MeuBlog.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IBlogService service;
        private readonly IPushSubscriptionStore subscriptionStore;
        private readonly PushServiceClient pushClient;
        private readonly IPushSubscriptionStoreAccessorProvider subscriptionStoreAccessorProvider;

        public HomeController(
            ILogger<HomeController> logger,
            IBlogService service,
            IPushSubscriptionStore subscriptionStore,
            PushServiceClient pushClient, 
            IPushSubscriptionStoreAccessorProvider subscriptionStoreAccessorProvider
        )
        {
            _logger = logger;
            this.service = service;
            this.subscriptionStore = subscriptionStore;
            this.pushClient = pushClient;
            this.subscriptionStoreAccessorProvider = subscriptionStoreAccessorProvider;
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

        [HttpGet("publickey")]
        public ContentResult GetPublicKey()
        {
            return Content(pushClient.DefaultAuthentication.PublicKey, "text/plain");
        }


        [HttpPost("subscriptions")]
        public async Task<IActionResult> StoreSubscription([FromBody] PushSubscription subscription)
        {
            int res = await subscriptionStore.StoreSubscriptionAsync(subscription);
            if (res > 0)
            {
                return CreatedAtAction(nameof(StoreSubscription), subscription);
            }
            return NoContent();
        }

        [HttpPost("notifications")]
        public async Task<IActionResult> SendNotification([FromBody] PushMessageViewModel messageVM)
        {
            var message = new PushMessage(messageVM.Notification)
            {
                Topic = messageVM.Topic,
                Urgency = messageVM.Urgency
            };

            await subscriptionStore.ForEachSubscriptionAsync(async (PushSubscription subscription) =>
            {
                try
                {
                    await pushClient.RequestPushMessageDeliveryAsync(subscription, message);
                }
                catch (Exception ex)


                {
                    await HandlePushMessageDeliveryException(ex, subscription);
                }
            });

            return NoContent();
        }

        private async Task HandlePushMessageDeliveryException(Exception exception, PushSubscription subscription)
        {
            var pushServiceClientException = exception as PushServiceClientException;
            if (pushServiceClientException is null)
            {
                _logger?.LogError(exception, "Failed requesting push message delivery to { 0}.", subscription.Endpoint);
            }
            else
            {
                if (pushServiceClientException.StatusCode == HttpStatusCode.NotFound || pushServiceClientException.StatusCode == HttpStatusCode.Gone)
                {
                    using (var subscriptionStoreAccessor = subscriptionStoreAccessorProvider.GetPushSubscriptionStoreAccessor())
{
                        await subscriptionStoreAccessor.PushSubscriptionStore.DiscardSubscriptionAsync(subscription.Endpoint);
                    }
                    _logger?.LogInformation("Subscription has expired or is no longer valid and has been removed.");
                }
            }
        }

    }
}
