import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal, GoalStatus } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateMetricsDto } from './dto/update-metrics.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AddPeerReviewDto } from './dto/add-peer-review.dto';
import { UpdateCompetenciesDto } from './dto/update-competencies.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    private usersService: UsersService,
  ) {}

  async create(createGoalDto: CreateGoalDto, managerId: string) {
    const employee = await this.usersService.findOne(createGoalDto.employeeId);
    const manager = await this.usersService.findOne(managerId);

    if (!employee || !manager) {
      throw new NotFoundException('Employee or manager not found');
    }

    // Verify if the manager has access to create goals for this employee
    const isManager = await this.usersService.isManagerOf(managerId, createGoalDto.employeeId);
    if (!isManager) {
      throw new ForbiddenException('You are not authorized to create goals for this employee');
    }

    const goal = this.goalRepository.create({
      ...createGoalDto,
      employee,
      manager,
    });

    return this.goalRepository.save(goal);
  }

  async findAll() {
    return this.goalRepository.find({
      relations: ['employee', 'manager'],
    });
  }

  async findByEmployee(employeeId: string) {
    return this.goalRepository.find({
      where: { employee: { id: employeeId } },
      relations: ['employee', 'manager'],
    });
  }

  async findByManager(managerId: string) {
    return this.goalRepository.find({
      where: { manager: { id: managerId } },
      relations: ['employee', 'manager'],
    });
  }

  async updateProgress(id: string, employeeId: string, progress: number) {
    const goal = await this.goalRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.employee.id !== employeeId) {
      throw new ForbiddenException('You can only update your own goals');
    }

    if (progress < 0 || progress > 100) {
      throw new ForbiddenException('Progress must be between 0 and 100');
    }

    goal.progress = progress;
    // Do not set status to COMPLETED here

    return this.goalRepository.save(goal);
  }

  async updateMetrics(id: string, employeeId: string, updateMetricsDto: UpdateMetricsDto) {
    const goal = await this.goalRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.employee.id !== employeeId) {
      throw new ForbiddenException('You can only update your own goals');
    }

    goal.metrics = {
      quantitative: updateMetricsDto.quantitative || [],
      qualitative: updateMetricsDto.qualitative || [],
    };

    // Update progress based on metrics
    if (updateMetricsDto.quantitative?.length) {
      const totalProgress = updateMetricsDto.quantitative.reduce((acc, metric) => {
        return acc + (metric.achieved / metric.target) * 100;
      }, 0);
      goal.progress = Math.round(totalProgress / updateMetricsDto.quantitative.length);

      if (goal.progress === 100) {
        goal.status = GoalStatus.COMPLETED;
      }
    }

    return this.goalRepository.save(goal);
  }

  async updateFeedback(id: string, userId: string, updateFeedbackDto: UpdateFeedbackDto, isManager: boolean) {
    const goal = await this.goalRepository.findOne({
      where: { id },
      relations: ['employee', 'manager'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    // Check if user is either the employee or the manager
    if (isManager) {
      if (goal.manager.id !== userId) {
        throw new ForbiddenException('You can only provide feedback for goals you manage');
      }
      goal.managerFeedback = updateFeedbackDto.feedback;
      if (updateFeedbackDto.rating) {
        goal.rating = updateFeedbackDto.rating;
      }
    } else {
      if (goal.employee.id !== userId) {
        throw new ForbiddenException('You can only provide feedback for your own goals');
      }
      goal.selfAssessment = updateFeedbackDto.feedback;
    }

    return this.goalRepository.save(goal);
  }

  async getTeamMetrics(managerId: string) {
    const goals = await this.goalRepository.find({
      where: { manager: { id: managerId } },
      relations: ['employee', 'manager'],
    });

    // Group goals by employee
    const employeeGoals = goals.reduce((acc, goal) => {
      const employeeId = goal.employee.id;
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee: goal.employee,
          totalGoals: 0,
          completedGoals: 0,
          averageProgress: 0,
          averageRating: 0,
        };
      }

      acc[employeeId].totalGoals++;
      if (goal.status === GoalStatus.COMPLETED) {
        acc[employeeId].completedGoals++;
      }
      acc[employeeId].averageProgress += goal.progress || 0;
      if (goal.rating) {
        acc[employeeId].averageRating += goal.rating;
      }

      return acc;
    }, {} as Record<string, {
      employee: User;
      totalGoals: number;
      completedGoals: number;
      averageProgress: number;
      averageRating: number;
    }>);

    // Calculate averages
    return Object.values(employeeGoals).map(stats => ({
      ...stats,
      averageProgress: Math.round(stats.averageProgress / stats.totalGoals),
      averageRating: stats.averageRating ? Math.round(stats.averageRating / stats.totalGoals * 10) / 10 : null,
    }));
  }

  async addPeerReview(goalId: string, reviewerId: string, addPeerReviewDto: AddPeerReviewDto) {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['employee', 'manager'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    // Check if reviewer is not the employee or manager
    if (reviewerId === goal.employee.id || reviewerId === goal.manager.id) {
      throw new ForbiddenException('Employee and manager cannot submit peer reviews');
    }

    const reviewer = await this.usersService.findOne(reviewerId);
    if (!reviewer) {
      throw new NotFoundException('Reviewer not found');
    }

    // Initialize peerReviews array if it doesn't exist
    if (!goal.peerReviews) {
      goal.peerReviews = [];
    }

    // Check if reviewer has already submitted a review
    const existingReviewIndex = goal.peerReviews.findIndex(
      review => review.reviewerId === reviewerId
    );

    const review = {
      reviewerId,
      reviewerName: reviewer.fullName,
      rating: addPeerReviewDto.rating,
      feedback: addPeerReviewDto.feedback,
      submittedAt: new Date(),
    };

    if (existingReviewIndex >= 0) {
      goal.peerReviews[existingReviewIndex] = review;
    } else {
      goal.peerReviews.push(review);
    }

    return this.goalRepository.save(goal);
  }

  async updateCompetencies(
    goalId: string,
    userId: string,
    updateCompetenciesDto: UpdateCompetenciesDto,
    isManager: boolean
  ) {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['employee', 'manager'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    // Check permissions
    if (isManager) {
      if (goal.manager.id !== userId) {
        throw new ForbiddenException('You can only update competencies for goals you manage');
      }
    } else {
      if (goal.employee.id !== userId) {
        throw new ForbiddenException('You can only update your own competencies');
      }
    }

    // Initialize competencies array if it doesn't exist
    if (!goal.competencies) {
      goal.competencies = updateCompetenciesDto.competencies.map(comp => ({
        ...comp,
        selfRating: undefined,
        selfComments: undefined,
        managerRating: undefined,
        managerComments: undefined,
      }));
    } else {
      // Update existing competencies
      updateCompetenciesDto.competencies.forEach(newComp => {
        const existingComp = goal.competencies.find(comp => comp.name === newComp.name);
        if (existingComp) {
          if (isManager) {
            existingComp.managerRating = newComp.managerRating;
            existingComp.managerComments = newComp.managerComments;
          } else {
            existingComp.selfRating = newComp.selfRating;
            existingComp.selfComments = newComp.selfComments;
          }
        } else {
          goal.competencies.push(newComp);
        }
      });
    }

    return this.goalRepository.save(goal);
  }

  async activateGoal(goalId: string, userId: string, feedback: string) {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['employee', 'manager'],
    });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    if (goal.manager.id !== userId) {
      throw new ForbiddenException('Only the manager can activate this goal');
    }
    if (goal.status !== GoalStatus.DRAFT) {
      throw new ForbiddenException('Only draft goals can be activated');
    }
    goal.status = GoalStatus.ACTIVE;
    if (feedback) {
      goal.managerFeedback = feedback;
    }
    return this.goalRepository.save(goal);
  }

  
  async submitForReview(goalId: string, userId: string) {
    const goal = await this.goalRepository.findOne({ where: { id: goalId }, relations: ['employee', 'manager'] });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.employee.id !== userId) throw new ForbiddenException('You can only submit your own goal for review');
    if (goal.status !== GoalStatus.ACTIVE) throw new ForbiddenException('Only active goals can be submitted for review');
    goal.status = GoalStatus.IN_REVIEW;
    return this.goalRepository.save(goal);
  }

  async approveReview(goalId: string, userId: string) {
    const goal = await this.goalRepository.findOne({ where: { id: goalId }, relations: ['employee', 'manager'] });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.manager.id !== userId) throw new ForbiddenException('Only the manager can approve the review');
    if (goal.status !== GoalStatus.IN_REVIEW) throw new ForbiddenException('Only goals in review can be approved');
    goal.status = GoalStatus.COMPLETED;
    return this.goalRepository.save(goal);
  }

  async rejectReview(goalId: string, userId: string, feedback: string) {
    const goal = await this.goalRepository.findOne({ where: { id: goalId }, relations: ['employee', 'manager'] });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.manager.id !== userId) throw new ForbiddenException('Only the manager can reject the review');
    if (goal.status !== GoalStatus.IN_REVIEW) throw new ForbiddenException('Only goals in review can be rejected');
    goal.status = GoalStatus.ACTIVE;
    if (feedback) goal.managerFeedback = feedback;
    return this.goalRepository.save(goal);
  }
} 