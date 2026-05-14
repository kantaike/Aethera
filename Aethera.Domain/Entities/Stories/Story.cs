using Aethera.Domain.Common;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Stories
{

    public class Story : Entity, IHasArt
    {
        public string Title { get; private set; }
        public string? Description { get; private set; }
        public string Content { get; private set; }
        public Culture Culture { get; private set; }
        public Guid? AuthorId { get; private set; }
        public Art? Art { get; private set; }

        private Story() { }

        public Story(string title, string? description, string content, Guid authorId, Culture culture)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required");

            Title = title;
            Description = description;
            Content = content;
            AuthorId = authorId;
            Culture = culture;
        }

        public void UpdateContent(string newContent)
        {
            Content = newContent;
        }

        public void SetArt(Art art)
        {
            Art = art;
        }
    }
}
