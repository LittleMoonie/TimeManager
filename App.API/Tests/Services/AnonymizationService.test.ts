import ActiveSession from "@/Entities/Users/ActiveSessions";
import { Repository } from "typeorm";
import User from "@/Entities/Users/User";
import { NotFoundError } from "@/Errors/HttpErrors";
import { AnonymizationService } from "../../Services/AnonymizationService";
import { UserRepository } from "../../Repositories/Users/UserRepository";

describe("AnonymizationService", () => {
  let service: AnonymizationService;
  let userRepository: jest.Mocked<Partial<UserRepository>>;
  let activeSessionRepository: jest.Mocked<Partial<Repository<ActiveSession>>>;

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    activeSessionRepository = {
      delete: jest.fn(),
    };

    service = new AnonymizationService(
      userRepository as any,
      activeSessionRepository as any
    );

    jest.clearAllMocks();
  });

  // ------------------- anonymizeUserData -------------------
  describe("anonymizeUserData", () => {
    it("anonymizes user data and deletes active sessions", async () => {
      // Arrange
      const userId = "test-user-id";
      const companyId = "test-company-id";

      const user = new User();
      user.id = userId;
      user.firstName = "John";
      user.lastName = "Doe";
      user.email = "john.doe@example.com";
      user.phoneNumber = "1234567890";
      user.companyId = companyId;
      user.passwordHash = "somehash";
      user.isAnonymized = false;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      // Act
      await service.anonymizeUserData(userId, companyId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(user.firstName).toBe("Deleted");
      expect(user.lastName).toBe("User");
      expect(user.email).toBe(`deleted-${userId}@gogotime.com`);
      expect(user.phoneNumber).toBeNull();
      expect(user.passwordHash).toBe("");
      expect(user.isAnonymized).toBe(true);
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(activeSessionRepository.delete).toHaveBeenCalledWith({ userId });
    });

    it("throws NotFoundError if user is not found", async () => {
      // Arrange
      const userId = "missing-user-id";
      const companyId = "company-id";
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.anonymizeUserData(userId, companyId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
