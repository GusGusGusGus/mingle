using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace API.Entities
{
    public class FBLocation
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        // If needed, you can parse city and country separately by splitting the name
        public string City => Name.Split(',')[0].Trim();
        public string Country => Name.Split(',').Length > 1 ? Name.Split(',')[1].Trim() : string.Empty;
    }
}