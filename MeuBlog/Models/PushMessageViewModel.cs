using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lib.Net.Http.WebPush;

namespace MeuBlog.Models
{
    public class PushMessageViewModel
    {
        public string Topic { get; set; }

        public string Notification { get; set; }

        public PushMessageUrgency Urgency { get; set; } = PushMessageUrgency.Normal;
    }
}
