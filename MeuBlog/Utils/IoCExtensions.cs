using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lib.Net.Http.WebPush;
using MeuBlog.Data;
using MeuBlog.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MeuBlog.Utils
{
    public static class IoCExtensions
    {
        private const string SQLITE_CONNECTION_STRING_NAME = "PushSubscriptionSqliteDatabase";
        public static IServiceCollection AddPushSubscriptionStore(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<PushSubscriptionContext>(options => options.UseSqlite(configuration.GetConnectionString(SQLITE_CONNECTION_STRING_NAME)));
            services.AddTransient<IPushSubscriptionStore, SqlitePushSubscriptionStore>();
            services.AddHttpContextAccessor();
            services.AddTransient<IPushSubscriptionStoreAccessorProvider, SqlitePushSubscriptionStoreAccessorProvider>();
            return services;
        }

        public static IServiceCollection AddPushNotificationService(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddOptions();
            services.AddMemoryCache();
            services.AddMemoryVapidTokenCache();
            services.AddPushServiceClient(options =>
            {
                var pushNotificationServiceConfigurationSection = configuration.GetSection(nameof(PushServiceClient));
                options.Subject = pushNotificationServiceConfigurationSection.GetValue<string>(nameof(options.Subject));
                options.PublicKey = pushNotificationServiceConfigurationSection.GetValue<string>(nameof(options.PublicKey));
                options.PrivateKey = pushNotificationServiceConfigurationSection.GetValue<string>(nameof(options.PrivateKey));
            });

            return services;
        }
    }
}
