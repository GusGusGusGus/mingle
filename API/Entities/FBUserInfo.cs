using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace API.Entities
{
    public class FBUserInfo
    {
        [JsonProperty("first_name")]
        public string FirstName { get; set; }
        [JsonProperty("last_name")]
        public string LastName { get; set; }
        [JsonProperty("email")]
        public string Email { get; set; }
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("gender")]
        public string Gender { get; set; }
    
        [JsonProperty("birthday")]
        public string? Birthday { get; set; }
        
        [JsonProperty("location")]
        public FBLocation Location { get; set; }

        // [JsonProperty("picture")]
        // public Picture Picture { get; set; }

    }
}