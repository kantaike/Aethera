namespace Aethera.Domain.Entities.Users
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public Role Role { get; set; } = Role.Reader;
    }
    public enum Role
    {
        Master,
        Player,
        Reader,
        Writer
    }
}