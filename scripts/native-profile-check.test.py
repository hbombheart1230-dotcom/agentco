"""P5.8 read-only machine-local checks; no raw configs, credentials or CLI calls."""
import os,json,tomllib,unittest
from pathlib import Path
import yaml
MODEL='nvidia/nemotron-3-super-120b-a12b:free'
ROOT=Path(__file__).resolve().parent.parent
class NativeProfiles(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        evidence=ROOT/'results/p5-8/local-config-result.json'
        if not evidence.exists():raise unittest.SkipTest('P5.8 local evidence absent; machine configuration NOT CHECKED')
        cls.evidence=json.loads(evidence.read_text(encoding='utf-8'))
        cls.codex=tomllib.loads(Path(cls.evidence['Codex']['path']).read_text(encoding='utf-8-sig'))
        cls.hermes=yaml.safe_load(Path(cls.evidence['Hermes']['path']).read_text(encoding='utf-8-sig'))
    def test_codex_persistent_provider_model_and_named_env_key(self):
        c=self.codex
        self.assertTrue(c.get('model')==MODEL and c.get('model_provider')=='agentco_openrouter')
        p=c.get('model_providers',{}).get('agentco_openrouter',{})
        self.assertTrue(p.get('base_url')=='https://openrouter.ai/api/v1' and p.get('env_key')=='OPENROUTER_API_KEY' and p.get('wire_api')=='responses' and p.get('requires_openai_auth') is False)
        self.assertTrue('auth' not in p and 'experimental_bearer_token' not in p)
    def test_hermes_persistent_main_title_compression_and_fallback_settings(self):
        h=self.hermes
        self.assertTrue(h.get('model',{}).get('provider')=='openrouter' and h.get('model',{}).get('default')==MODEL)
        self.assertTrue(h.get('compression',{}).get('enabled') is False)
        self.assertTrue(h.get('auxiliary',{}).get('title_generation',{}).get('enabled') is False)
        self.assertTrue(h.get('fallback_providers')==[] and h.get('fallback_model')==[])
    def test_hermes_auxiliary_tasks_pin_reference_without_literal_keys(self):
        aux=self.hermes.get('auxiliary',{})
        self.assertTrue(aux.get('free_only') is True and aux.get('openrouter_model')==MODEL)
        for task in self.evidence['Hermes']['auxiliary_tasks_pinned']:
            d=aux.get(task,{})
            self.assertTrue(d.get('provider')=='openrouter' and d.get('model')==MODEL and d.get('api_key')=='${OPENROUTER_API_KEY}' and d.get('fallback_chain')==[])
        self.assertTrue(self.hermes.get('delegation',{}).get('fallback_providers')==[])
    def test_local_backups_and_unrelated_settings_preserved(self):
        c=tomllib.loads(Path(self.evidence['Codex']['backup_path']).read_text(encoding='utf-8-sig'))
        h=yaml.safe_load(Path(self.evidence['Hermes']['backup_path']).read_text(encoding='utf-8-sig'))
        for k,v in c.items():
            if k not in {'model','model_provider','model_providers'}:self.assertTrue(self.codex.get(k)==v)
        for k,v in c.get('model_providers',{}).items():self.assertTrue(self.codex.get('model_providers',{}).get(k)==v)
        for k,v in h.items():
            if k not in {'model','compression','auxiliary','fallback_providers','fallback_model','memory','delegation'}:self.assertTrue(self.hermes.get(k)==v)
        for section,allowed in [('model',{'provider','default'}),('compression',{'enabled'}),('memory',{'memory_enabled','user_profile_enabled'}),('delegation',{'provider','model','fallback_providers'})]:
            for k,v in h.get(section,{}).items():
                if k not in allowed:self.assertTrue(self.hermes.get(section,{}).get(k)==v)
        self.assertTrue(all(row['backup_verified'] and row['backup_acl_restricted'] for row in self.evidence.values()))
if __name__=='__main__':unittest.main(verbosity=2)
