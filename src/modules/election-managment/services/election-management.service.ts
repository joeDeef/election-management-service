import { Injectable } from '@nestjs/common';
import { ElectionRepository } from '../repository/election.repository';
import { CreateElectionDto } from '../dto/create-election.dto';
import { CreateCandidateDto } from '../dto/create-candidate.dto';

@Injectable()
export class ElectionManagementService {
  constructor(private readonly repository: ElectionRepository) {}

  async create(createElectionDto: CreateElectionDto) {
    return await this.repository.createElection(createElectionDto);
  }

  async findAll() {
    return await this.repository.findAllElections();
  }

  async createCandidate(dto: CreateCandidateDto) {
    return await this.repository.createCandidate(dto);
  }

  async getCandidatesByCampaign(name: string) {
    return await this.repository.findCandidatesByElectionName(name);
  }
  async getCandidatesByElectionID(election_id: string) {
    return await this.repository.findCandidatesByElectionID(election_id);
  }

  async getCandidatesToday() {
    const today = new Date().toISOString().split('T')[0];
    return await this.repository.findCandidatesByElectionDate(today);
  }
}
