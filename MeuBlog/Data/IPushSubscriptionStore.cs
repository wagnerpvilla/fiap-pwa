using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Lib.Net.Http.WebPush;

namespace MeuBlog.Data
{
    public interface IPushSubscriptionStore
    {
        Task<int> StoreSubscriptionAsync(PushSubscription subscription);

        Task ForEachSubscriptionAsync(Action<PushSubscription> action);

        Task ForEachSubscriptionAsync(Action<PushSubscription> action, CancellationToken cancellationToken);

        Task DiscardSubscriptionAsync(string endpoint);
    }
}
