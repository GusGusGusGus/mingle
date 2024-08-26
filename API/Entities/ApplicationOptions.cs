using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class ApplicationOptions
    {
        public string BaseUrl { get; set; }
        public string ApiUrl { get; set; }
        public string FacebookAppID { get; set; }
        public string FacebookAppSecret { get; set; }
        public string GoogleClientId { get; set; }
    }
}