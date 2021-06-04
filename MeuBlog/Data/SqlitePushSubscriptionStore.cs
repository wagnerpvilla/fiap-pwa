using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Lib.Net.Http.WebPush;
using Microsoft.EntityFrameworkCore;

namespace MeuBlog.Data
{
    public class SqlitePushSubscriptionStore : IPushSubscriptionStore
    {
        private readonly PushSubscriptionContext _context;
        public SqlitePushSubscriptionStore(PushSubscriptionContext context)
        {
            _context = context;
        }

        public async Task DiscardSubscriptionAsync(string endpoint)
        {
            PushSubscriptionContext.PushSubscription subscription = await _context.Subscriptions.FindAsync(endpoint);

            _context.Subscriptions.Remove(subscription);

            await _context.SaveChangesAsync();
        }

        public Task ForEachSubscriptionAsync(Action<PushSubscription> action)
        {
            return ForEachSubscriptionAsync(action, CancellationToken.None);
        }
        public Task ForEachSubscriptionAsync(Action<PushSubscription> action, CancellationToken cancellationToken)
        {
            return _context.Subscriptions
                .AsNoTracking()
                .ForEachAsync(action, cancellationToken);
        }


        public Task<int> StoreSubscriptionAsync(PushSubscription subscription)
        {
            if (_context.Subscriptions.Any(_ => _.Endpoint == subscription.Endpoint))
            {
                return Task.FromResult(0);
            }
            _context.Subscriptions.Add(new PushSubscriptionContext.PushSubscription(subscription));
            return _context.SaveChangesAsync();
        
        }
    }
}
