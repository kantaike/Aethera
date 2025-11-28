using System;
using System.Collections.Generic;
using Aethera.Domain.Entities.Characters;
using Aethera.Infrastructure.Entities;
using AutoMapper;

namespace Aethera.Infrastructure.Persistence
{
    public interface IMapper
    {
        TTarget Map<TSource, TTarget>(TSource source);
        TTarget Map<TSource, TTarget>(TSource source, TTarget destination);
    }

    public class AutoMapperWrapper : IMapper
    {
        private readonly AutoMapper.IMapper _mapper;

        public AutoMapperWrapper(AutoMapper.IMapper mapper)
        {
            _mapper = mapper;
        }

        public TTarget Map<TSource, TTarget>(TSource source)
        {
            return _mapper.Map<TSource, TTarget>(source);
        }

        public TTarget Map<TSource, TTarget>(TSource source, TTarget destination)
        {
            return _mapper.Map(source, destination);
        }
    }

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // When mapping from persistence -> domain, avoid mutating domain read-only collections
            CreateMap<CharacterEntity, Character>()
                .ForMember(dest => dest.Spells, opt => opt.Ignore())
                .ForMember(dest => dest.Weapons, opt => opt.Ignore())
                .ForMember(dest => dest.Armors, opt => opt.Ignore())
                .ForMember(dest => dest.Equipments, opt => opt.Ignore())
                .ForMember(dest => dest.Items, opt => opt.Ignore());

            // Translations -> domain: map scalar translatable fields
            CreateMap<CharacterTranslationEntity, Character>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Feats, opt => opt.MapFrom(src => src.Feats))
                .ForMember(dest => dest.Backstory, opt => opt.MapFrom(src => src.Backstory))
                .ForMember(dest => dest.Personality, opt => opt.MapFrom(src => src.Personality))
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));


            // When mapping from domain -> persistence, ignore destination read-only wrappers
            // and ignore Translations (handled explicitly in repository)
            CreateMap<Character, CharacterEntity>()
                .ForMember(dest => dest.Spells, opt => opt.Ignore())
                .ForMember(dest => dest.Weapons, opt => opt.Ignore())
                .ForMember(dest => dest.Armors, opt => opt.Ignore())
                .ForMember(dest => dest.Equipments, opt => opt.Ignore())
                .ForMember(dest => dest.Items, opt => opt.Ignore())
                .ForMember(dest => dest.Translations, opt => opt.Ignore());

            // Domain -> translation entity (used when creating translations)
            CreateMap<Character, CharacterTranslationEntity>()
                .ForMember(dest => dest.CharacterId, opt => opt.Ignore());
        }
    }
}
