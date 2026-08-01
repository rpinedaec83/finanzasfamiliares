using KipuFinanzas.SharedContracts;
using Microsoft.EntityFrameworkCore;

namespace KipuFinanzas.Api.Data;

public class KipuDbContext : DbContext
{
    private readonly Guid? _currentFamilyId;

    public KipuDbContext(DbContextOptions<KipuDbContext> options, Guid? currentFamilyId = null)
        : base(options)
    {
        _currentFamilyId = currentFamilyId;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Family> Families => Set<Family>();
    public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
    public DbSet<FinancialInstitution> FinancialInstitutions => Set<FinancialInstitution>();
    public DbSet<CategoryItem> Categories => Set<CategoryItem>();
    public DbSet<AiClassificationRule> AiRules => Set<AiClassificationRule>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<CreditCard> CreditCards => Set<CreditCard>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Transfer> Transfers => Set<Transfer>();
    public DbSet<CurrencyExchangeOperation> CurrencyExchangeOperations => Set<CurrencyExchangeOperation>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<SavingsGoal> SavingsGoals => Set<SavingsGoal>();
    public DbSet<ExchangeRate> ExchangeRates => Set<ExchangeRate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aislamiento Multi-inquilino por Familia mediante Global Query Filters
        if (_currentFamilyId.HasValue)
        {
            modelBuilder.Entity<Account>().HasQueryFilter(a => a.FamilyId == _currentFamilyId.Value);
            modelBuilder.Entity<CreditCard>().HasQueryFilter(c => c.FamilyId == _currentFamilyId.Value);
            modelBuilder.Entity<Transaction>().HasQueryFilter(t => t.FamilyId == _currentFamilyId.Value);
            modelBuilder.Entity<Transfer>().HasQueryFilter(t => t.FamilyId == _currentFamilyId.Value);
            modelBuilder.Entity<CurrencyExchangeOperation>().HasQueryFilter(e => e.FamilyId == _currentFamilyId.Value);
            modelBuilder.Entity<Budget>().HasQueryFilter(b => b.FamilyId == _currentFamilyId.Value);
            modelBuilder.Entity<SavingsGoal>().HasQueryFilter(g => g.FamilyId == _currentFamilyId.Value);
        }

        // Datos Semilla de Bancos en Perú
        modelBuilder.Entity<FinancialInstitution>().HasData(
            new FinancialInstitution
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                Name = "Banco de Crédito del Perú (BCP)",
                Code = "BCP",
                Country = "PE",
                LogoUrl = "/assets/banks/bcp.png"
            },
            new FinancialInstitution
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                Name = "BBVA Perú",
                Code = "BBVA",
                Country = "PE",
                LogoUrl = "/assets/banks/bbva.png"
            },
            new FinancialInstitution
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                Name = "Interbank",
                Code = "INTERBANK",
                Country = "PE",
                LogoUrl = "/assets/banks/interbank.png"
            },
            new FinancialInstitution
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000004"),
                Name = "Banco Falabella",
                Code = "FALABELLA",
                Country = "PE",
                LogoUrl = "/assets/banks/falabella.png"
            }
        );
    }
}
